
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Student {
  id: string;
  name: string;
  wallet_address?: string;
  user_id: string;
}

export interface NFT {
  id: string;
  metadata: any;
}

export const useTransferData = () => {
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [availableNfts, setAvailableNfts] = useState<NFT[]>([]);
  
  useEffect(() => {
    checkUserRole();
    if (isTeacher) {
      fetchStudents();
      fetchAvailableNfts();
    }
  }, [isTeacher]);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      setIsTeacher(userRole?.role === 'teacher');
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };
  
  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Get teacher's classrooms
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
        
      if (!teacherProfile) {
        setLoading(false);
        return;
      }
      
      // Get teacher's classrooms
      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id')
        .eq('teacher_id', teacherProfile.id);
        
      if (!classrooms || classrooms.length === 0) {
        setLoading(false);
        return;
      }
      
      // Get classroom student IDs
      const classroomIds = classrooms.map(c => c.id);
      const { data: classroomStudents } = await supabase
        .from('classroom_students')
        .select('student_id')
        .in('classroom_id', classroomIds);
        
      if (!classroomStudents || classroomStudents.length === 0) {
        setLoading(false);
        return;
      }
      
      // Get student details
      const studentIds = classroomStudents.map(cs => cs.student_id);
      const { data: studentData } = await supabase
        .from('students')
        .select('id, name, user_id')
        .in('id', studentIds);
        
      if (studentData) {
        // Get wallet addresses for each student
        const studentWallets = await Promise.all(
          studentData.map(async (student) => {
            const { data: wallet } = await supabase
              .from('wallets')
              .select('address')
              .eq('user_id', student.user_id)
              .single();
              
            return {
              ...student,
              wallet_address: wallet?.address
            };
          })
        );
        
        setStudents(studentWallets);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const fetchAvailableNfts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: teacherWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!teacherWallet) return;

      // Fetch available NFTs that are not yet assigned to students
      const { data: nfts } = await supabase
        .from('nfts')
        .select('*')
        .is('owner_wallet_id', null);

      setAvailableNfts(nfts || []);
    } catch (error) {
      console.error('Error fetching available NFTs:', error);
    }
  };

  const refreshNfts = () => {
    fetchAvailableNfts();
  };

  return {
    isTeacher,
    loading,
    students,
    availableNfts,
    refreshNfts
  };
};
