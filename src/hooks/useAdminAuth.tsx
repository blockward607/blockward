
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (userRole?.role === 'admin') {
        navigate('/admin-dashboard');
      }
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
        return;
      }

      if (data.user) {
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (roleError || !userRole) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Unable to verify admin privileges",
          });
          await supabase.auth.signOut();
          return;
        }

        if (userRole.role !== 'admin') {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Admin privileges required to access this panel",
          });
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: "Welcome to Admin Panel",
          description: "Successfully authenticated as administrator",
        });

        navigate('/admin-dashboard');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during login",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin'
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: error.message,
        });
        return;
      }

      if (data.user) {
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'admin'
        });

        toast({
          title: "Admin Account Created",
          description: "Please check your email to verify your account, then sign in.",
        });
        
        setActiveTab("signin");
      }
    } catch (error) {
      toast({
        variant: "destructive", 
        title: "Error",
        description: "An unexpected error occurred during signup",
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
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    loading,
    activeTab,
    setActiveTab,
    handleAdminLogin,
    handleAdminSignup
  };
};
