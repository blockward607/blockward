
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found, redirecting to auth');
        navigate('/auth');
        return;
      }

      console.log('Checking admin access for user:', session.user.id);

      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        toast({
          variant: "destructive",
          title: "Access Error",
          description: "Failed to verify admin privileges"
        });
        navigate('/dashboard');
        return;
      }

      console.log('User role:', userRole?.role);

      if (!userRole || userRole.role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Admin privileges required"
        });
        navigate('/dashboard');
        return;
      }

      console.log('Admin access granted');
      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin access:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify admin access"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-black to-indigo-900">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Access denied</p>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminLayout;
