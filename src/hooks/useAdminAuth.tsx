
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing admin session in background without showing loading
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Check if user is already admin
          const { data: userRole, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          if (!roleError && userRole?.role === 'admin') {
            navigate('/admin-dashboard', { replace: true });
          }
        }
      } catch (error) {
        // Silently handle errors - don't block the UI
        console.error('Background auth check error:', error);
      }
    };

    checkExistingSession();
  }, [navigate]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('useAdminAuth: Starting admin login for:', email);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('useAdminAuth: Login error:', error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
        return;
      }

      if (data.user) {
        console.log('useAdminAuth: Login successful for user:', data.user.id);
        
        // Check user role
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (roleError && roleError.code !== 'PGRST116') {
          console.error('useAdminAuth: Role check error:', roleError);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Failed to verify admin privileges.",
          });
          return;
        }

        if (!userRole || userRole.role !== 'admin') {
          console.log('useAdminAuth: User is not admin');
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Admin privileges required to access this panel",
          });
          await supabase.auth.signOut();
          return;
        }

        console.log('useAdminAuth: Admin login successful, redirecting to dashboard');
        toast({
          title: "Welcome to Admin Panel",
          description: "Successfully authenticated as administrator",
        });

        navigate('/admin-dashboard', { replace: true });
      }
    } catch (error) {
      console.error('useAdminAuth: Unexpected login error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during login",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleAdminLogin,
  };
};
