
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminStats, AdminButton } from "../types";

export const useAdminControlData = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    pendingRequests: 0
  });
  const [adminButtons, setAdminButtons] = useState<AdminButton[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await Promise.all([
        loadAdminButtons(),
        loadAdminStats()
      ]);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin data"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAdminButtons = async () => {
    try {
      const { data: buttons, error } = await supabase
        .from('admin_buttons')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading admin buttons:', error);
        return;
      }

      const transformedButtons = buttons?.map(button => ({
        ...button,
        permissions: Array.isArray(button.permissions) ? button.permissions : []
      })) || [];

      setAdminButtons(transformedButtons);
    } catch (error) {
      console.error('Error loading admin buttons:', error);
    }
  };

  const loadAdminStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('school_id')
        .eq('user_id', session.user.id)
        .single();

      if (!adminProfile) return;

      const [studentsData, teachersData, classroomsData, requestsData] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }).eq('school_id', adminProfile.school_id),
        supabase.from('teacher_profiles').select('id', { count: 'exact' }).eq('school_id', adminProfile.school_id),
        supabase.from('classrooms').select('id', { count: 'exact' }).eq('school_id', adminProfile.school_id),
        supabase.from('admin_requests').select('id', { count: 'exact' }).eq('status', 'pending')
      ]);

      setStats({
        totalStudents: studentsData.count || 0,
        totalTeachers: teachersData.count || 0,
        totalClasses: classroomsData.count || 0,
        pendingRequests: requestsData.count || 0
      });

    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  return {
    stats,
    adminButtons,
    loading
  };
};
