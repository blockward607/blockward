
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/auth/useAdminAuth";
import { AdminBackButton } from "@/components/admin/auth/AdminBackButton";
import { AdminAuthForm } from "@/components/admin/auth/AdminAuthForm";

const AdminAuthContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showError, errorMessage, resetError } = useAdminAuth();

  useEffect(() => {
    if (user) {
      checkUserRoleAndRedirect();
    }
  }, [user, navigate]);

  const checkUserRoleAndRedirect = async () => {
    if (!user) return;
    
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData?.role === 'admin') {
        navigate('/admin-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <AdminBackButton />
        <AdminAuthForm 
          showError={showError}
          errorMessage={errorMessage}
          onResetError={resetError}
        />
      </motion.div>
    </div>
  );
};

const AdminAuth = () => {
  return (
    <AdminAuthProvider>
      <AdminAuthContent />
    </AdminAuthProvider>
  );
};

export default AdminAuth;
