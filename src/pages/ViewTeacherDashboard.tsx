
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ViewTeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No session found, redirecting to auth');
          navigate('/auth', { replace: true });
          return;
        }

        // Check user role
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Error checking user role:', roleError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to check user permissions"
          });
          navigate('/auth', { replace: true });
          return;
        }

        // Redirect based on role
        if (userRole?.role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else if (userRole?.role === 'teacher') {
          navigate('/dashboard', { replace: true });
        } else if (userRole?.role === 'student') {
          navigate('/student-dashboard', { replace: true });
        } else {
          // No role found, redirect to auth
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Error in role check:', error);
        navigate('/auth', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkUserRoleAndRedirect();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-white text-lg">Checking access permissions...</p>
          <p className="text-gray-400 text-sm mt-2">Redirecting to appropriate dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default ViewTeacherDashboard;
