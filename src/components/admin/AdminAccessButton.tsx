
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
        setLoading(false);
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
        setLoading(false);
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check user status"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = async (path: string, buttonName: string) => {
    try {
      console.log(`${buttonName} button clicked - navigating to:`, path);
      
      // Prevent multiple clicks
      if (loading) {
        console.log('Navigation already in progress, ignoring click');
        return;
      }

      setLoading(true);
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      navigate(path);
      
      toast({
        title: "Navigation",
        description: `Opening ${buttonName}...`
      });
      
    } catch (error: any) {
      console.error('Error navigating:', error);
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: "Failed to navigate. Please try refreshing the page."
      });
    } finally {
      // Reset loading after navigation
      setTimeout(() => setLoading(false), 500);
    }
  };

  if (loading && !userRole) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        <span className="ml-2 text-sm text-gray-400">Loading permissions...</span>
      </div>
    );
  }

  // Show appropriate buttons based on role
  if (userRole === 'admin') {
    return (
      <div className="space-y-2">
        <Button 
          onClick={() => handleNavigation('/admin', 'Admin Dashboard')}
          className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2 transition-colors"
          disabled={loading}
        >
          <Shield className="w-4 h-4" />
          {loading ? 'Loading...' : 'Admin Dashboard'}
        </Button>
        <Button 
          onClick={() => handleNavigation('/school-setup', 'School Setup')}
          variant="outline"
          className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-600/20 flex items-center gap-2 transition-colors"
          disabled={loading}
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
          onClick={() => handleNavigation('/school-setup', 'School Setup')}
          className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition-colors"
          disabled={loading}
        >
          <Building className="w-4 h-4" />
          {loading ? 'Loading...' : (hasSchool ? 'School Settings' : 'Setup School')}
        </Button>
        <Button 
          onClick={() => handleNavigation('/admin-setup', 'Admin Setup')}
          variant="outline"
          className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-600/20 flex items-center gap-2 transition-colors"
          disabled={loading}
        >
          <Settings className="w-4 h-4" />
          Request Admin Access
        </Button>
      </div>
    );
  }

  // For students or users without roles - but still show options
  return (
    <div className="space-y-2">
      <Button 
        onClick={() => handleNavigation('/dashboard', 'Dashboard')}
        className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2 transition-colors"
        disabled={loading}
      >
        <Building className="w-4 h-4" />
        {loading ? 'Loading...' : 'Go to Dashboard'}
      </Button>
      <Button 
        onClick={() => handleNavigation('/admin-setup', 'Admin Setup')}
        variant="outline"
        className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-600/20 flex items-center gap-2 transition-colors"
        disabled={loading}
      >
        <Settings className="w-4 h-4" />
        Request Admin Access
      </Button>
    </div>
  );
};
