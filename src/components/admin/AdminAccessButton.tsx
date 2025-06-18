
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Settings, School, Building, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const AdminAccessButton = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasSchool, setHasSchool] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        return;
      }

      if (!session) {
        console.log('No session found');
        return;
      }

      console.log('Checking admin status for user:', session.user.id);

      // Check if user is admin
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        return;
      }

      console.log('User role:', userRole);

      const isUserAdmin = userRole?.role === 'admin';
      setIsAdmin(isUserAdmin);

      // Check if user has a school (admin profile)
      if (isUserAdmin) {
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

    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    try {
      console.log('Navigating to:', path);
      navigate(path);
      toast({
        title: "Navigating...",
        description: `Going to ${path.replace('/', '').replace('-', ' ')}`
      });
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
        <span className="ml-2 text-sm text-gray-400">Loading admin status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isAdmin ? (
        <>
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
        </>
      ) : (
        <>
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
            Setup Admin Account
          </Button>
        </>
      )}
    </div>
  );
};
