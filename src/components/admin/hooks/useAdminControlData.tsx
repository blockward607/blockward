
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

  // Fallback admin buttons if database is empty
  const fallbackButtons: AdminButton[] = [
    {
      id: '1',
      title: 'Manage Students',
      description: 'View and manage all students',
      icon: 'Users',
      route: '/students',
      color: 'bg-blue-500',
      permissions: [],
      is_active: true,
      sort_order: 1
    },
    {
      id: '2', 
      title: 'Manage Teachers',
      description: 'View and manage teacher accounts',
      icon: 'UserPlus',
      route: '/admin/teachers',
      color: 'bg-green-500',
      permissions: [],
      is_active: true,
      sort_order: 2
    },
    {
      id: '3',
      title: 'Classroom Management', 
      description: 'Oversee all classrooms',
      icon: 'BookOpen',
      route: '/classes',
      color: 'bg-purple-500',
      permissions: [],
      is_active: true,
      sort_order: 3
    },
    {
      id: '4',
      title: 'School Settings',
      description: 'Configure school preferences', 
      icon: 'School',
      route: '/school-setup',
      color: 'bg-orange-500',
      permissions: [],
      is_active: true,
      sort_order: 4
    },
    {
      id: '5',
      title: 'System Analytics',
      description: 'View detailed analytics',
      icon: 'BarChart3', 
      route: '/admin/analytics',
      color: 'bg-cyan-500',
      permissions: [],
      is_active: true,
      sort_order: 5
    },
    {
      id: '6',
      title: 'Admin Requests',
      description: 'Review pending requests',
      icon: 'Shield',
      route: '/admin/requests', 
      color: 'bg-red-500',
      permissions: [],
      is_active: true,
      sort_order: 6
    }
  ];

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      console.log('🔄 Loading admin data...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('❌ No session found');
        setAdminButtons(fallbackButtons);
        setLoading(false);
        return;
      }

      console.log('✅ Session found, loading data for user:', session.user.id);

      await Promise.all([
        loadAdminButtons(),
        loadAdminStats()
      ]);

    } catch (error) {
      console.error('❌ Error loading admin data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin data, using default buttons"
      });
      
      // Use fallback buttons on error
      setAdminButtons(fallbackButtons);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminButtons = async () => {
    try {
      console.log('🔄 Loading admin buttons from database...');
      const { data: buttons, error } = await supabase
        .from('admin_buttons')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('❌ Error loading admin buttons:', error);
        console.log('🔄 Using fallback buttons');
        setAdminButtons(fallbackButtons);
        return;
      }

      if (!buttons || buttons.length === 0) {
        console.log('⚠️ No buttons found in database, using fallback');
        setAdminButtons(fallbackButtons);
        return;
      }

      const transformedButtons = buttons.map(button => ({
        ...button,
        permissions: Array.isArray(button.permissions) ? button.permissions : []
      }));

      console.log('✅ Loaded admin buttons:', transformedButtons.length);
      setAdminButtons(transformedButtons);
    } catch (error) {
      console.error('❌ Error loading admin buttons:', error);
      setAdminButtons(fallbackButtons);
    }
  };

  const loadAdminStats = async () => {
    try {
      console.log('🔄 Loading admin stats...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Try to get admin profile first
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('school_id')
        .eq('user_id', session.user.id)
        .single();

      // If no admin profile, try teacher profile
      let schoolId = adminProfile?.school_id;
      if (!schoolId) {
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('school_id')
          .eq('user_id', session.user.id)
          .single();
        
        schoolId = teacherProfile?.school_id;
      }

      if (!schoolId) {
        console.log('⚠️ No school association found, using default stats');
        return;
      }

      console.log('✅ Loading stats for school:', schoolId);

      const [studentsData, teachersData, classroomsData, requestsData] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }).eq('school_id', schoolId),
        supabase.from('teacher_profiles').select('id', { count: 'exact' }).eq('school_id', schoolId),
        supabase.from('classrooms').select('id', { count: 'exact' }).eq('school_id', schoolId),
        supabase.from('admin_requests').select('id', { count: 'exact' }).eq('status', 'pending')
      ]);

      const newStats = {
        totalStudents: studentsData.count || 0,
        totalTeachers: teachersData.count || 0,
        totalClasses: classroomsData.count || 0,
        pendingRequests: requestsData.count || 0
      };

      console.log('✅ Loaded admin stats:', newStats);
      setStats(newStats);

    } catch (error) {
      console.error('❌ Error loading admin stats:', error);
    }
  };

  return {
    stats,
    adminButtons,
    loading
  };
};
