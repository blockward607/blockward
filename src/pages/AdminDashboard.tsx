
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TeacherAdminFeatures } from "@/components/admin/TeacherAdminFeatures";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
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
        
        // Simple check - if user exists, they can access admin features
        console.log('Admin dashboard initialized for user:', session.user.id);
        
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <TeacherAdminFeatures />
    </div>
  );
};

export default AdminDashboard;
