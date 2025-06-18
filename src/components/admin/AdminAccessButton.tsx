
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
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found');
        return;
      }

      console.log('Checking admin status for user:', session.user.id);

      // Check if user is admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      console.log('User role:', userRole);

      const isUserAdmin = userRole?.role === 'admin';
      setIsAdmin(isUserAdmin);

      // Check if user has a school (admin profile)
      if (isUserAdmin) {
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('school_id')
          .eq('user_id', session.user.id)
          .single();

        console.log('Admin profile:', adminProfile);
        setHasSchool(!!adminProfile?.school_id);
      }

    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDashboard = async () => {
    setActionLoading(true);
    try {
      console.log('Navigating to admin dashboard');
      navigate('/admin');
    } catch (error) {
      console.error('Error navigating to admin:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to access admin dashboard"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSchoolSetup = async () => {
    setActionLoading(true);
    try {
      console.log('Navigating to school setup');
      navigate('/school-setup');
    } catch (error) {
      console.error('Error navigating to school setup:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to access school setup"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminSetup = async () => {
    setActionLoading(true);
    try {
      console.log('Navigating to admin setup');
      navigate('/admin-setup');
    } catch (error) {
      console.error('Error navigating to admin setup:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to access admin setup"
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isAdmin ? (
        <>
          <Button 
            onClick={handleAdminDashboard}
            disabled={actionLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            Admin Dashboard
          </Button>
          <Button 
            onClick={handleSchoolSetup}
            disabled={actionLoading}
            variant="outline"
            className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-600/20 flex items-center gap-2"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <School className="w-4 h-4" />
            )}
            {hasSchool ? 'School Settings' : 'Setup School'}
          </Button>
        </>
      ) : (
        <>
          <Button 
            onClick={handleSchoolSetup}
            disabled={actionLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Building className="w-4 h-4" />
            )}
            Setup School
          </Button>
          <Button 
            onClick={handleAdminSetup}
            disabled={actionLoading}
            variant="outline"
            className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-600/20 flex items-center gap-2"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Settings className="w-4 h-4" />
            )}
            Setup Admin Account
          </Button>
        </>
      )}
    </div>
  );
};
