
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  name: string;
  school?: string;
  points: number;
  created_at: string;
}

export const useStudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadStudents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get teacher profile to filter by school
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('school_id')
        .eq('user_id', session.user.id)
        .single();

      if (!teacherProfile) return;

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', teacherProfile.school_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students"
      });
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (name: string, school: string = '') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get teacher profile to get school_id
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('school_id')
        .eq('user_id', session.user.id)
        .single();

      if (!teacherProfile) {
        throw new Error('Teacher profile not found');
      }

      const { data, error } = await supabase
        .from('students')
        .insert([{ 
          name, 
          school, 
          points: 0,
          school_id: teacherProfile.school_id
        }])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setStudents(prev => [data[0], ...prev]);
        toast({
          title: "Success",
          description: "Student added successfully"
        });
      }
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add student"
      });
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStudents(prev => prev.filter(student => student.id !== id));
      toast({
        title: "Success",
        description: "Student deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete student"
      });
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  return {
    students,
    loading,
    addStudent,
    deleteStudent,
    refreshStudents: loadStudents,
  };
};
