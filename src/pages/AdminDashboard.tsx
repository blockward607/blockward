
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PendingUsersManagement } from "@/components/admin/PendingUsersManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [adminSchoolId, setAdminSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth', { replace: true });
          return;
        }

        setUser(session.user);

        // Check if user is admin
        const { data: adminProfile, error: adminError } = await supabase
          .from('admin_profiles')
          .select('school_id, full_name')
          .eq('user_id', session.user.id)
          .single();

        if (adminError && adminError.code !== 'PGRST116') {
          console.error('Error checking admin profile:', adminError);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Failed to verify admin privileges"
          });
          navigate('/', { replace: true });
          return;
        }

        if (!adminProfile) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Admin privileges required"
          });
          navigate('/', { replace: true });
          return;
        }

        setAdminSchoolId(adminProfile.school_id);
      } catch (error) {
        console.error('Initialization error:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize admin dashboard"
        });
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your school's users and settings</p>
        </motion.div>
        
        <PendingUsersManagement schoolId={adminSchoolId} />
      </div>
    </div>
  );
};

export default AdminDashboard;
