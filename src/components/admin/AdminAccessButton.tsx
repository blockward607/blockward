
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Settings, School, Building, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const AdminAccessButton = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasSchool, setHasSchool] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        return;
      }

      console.log('Checking user status for:', session.user.id);

      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        return;
      }

      console.log('User role data:', roleData);
      const role = roleData?.role;
      setUserRole(role);

      // Check if user has admin profile (for admins)
      if (role === 'admin') {
        const { data: adminProfile, error: profileError } = await supabase
          .from('admin_profiles')
          .select('school_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching admin profile:', profileError);
        } else {
          console.log('Admin profile:', adminProfile);
          setHasSchool(!!adminProfile?.school_id);
        }
      }

      // Check if user has teacher profile (for teachers)
      if (role === 'teacher') {
        const { data: teacherProfile, error: profileError } = await supabase
          .from('teacher_profiles')
          .select('school_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching teacher profile:', profileError);
        } else {
          console.log('Teacher profile:', teacherProfile);
          setHasSchool(!!teacherProfile?.school_id);
        }
      }

    } catch (error) {
      console.error('Error checking user status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    try {
      console.log('Navigating to:', path);
      navigate(path);
    } catch (error: any) {
      console.error('Error navigating:', error);
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: "Failed to navigate. Please try refreshing the page."
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        <span className="ml-2 text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  // Show appropriate buttons based on role
  if (userRole === 'admin') {
    return (
      <div className="space-y-2">
        <Button 
          onClick={() => handleNavigation('/admin')}
          className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Admin Dashboard
        </Button>
        <Button 
          onClick={() => handleNavigation('/school-setup')}
          variant="outline"
          className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-600/20 flex items-center gap-2"
        >
          <School className="w-4 h-4" />
          {hasSchool ? 'School Settings' : 'Setup School'}
        </Button>
      </div>
    );
  }

  if (userRole === 'teacher') {
    return (
      <div className="space-y-2">
        <Button 
          onClick={() => handleNavigation('/school-setup')}
          className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Building className="w-4 h-4" />
          {hasSchool ? 'School Settings' : 'Setup School'}
        </Button>
        <Button 
          onClick={() => handleNavigation('/admin-setup')}
          variant="outline"
          className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-600/20 flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Request Admin Access
        </Button>
      </div>
    );
  }

  // For students or users without roles
  return (
    <div className="space-y-2">
      <Button 
        onClick={() => handleNavigation('/school-setup')}
        className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
      >
        <Building className="w-4 h-4" />
        Setup School
      </Button>
      <Button 
        onClick={() => handleNavigation('/admin-setup')}
        variant="outline"
        className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-600/20 flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Request Admin Access
      </Button>
    </div>
  );
};
