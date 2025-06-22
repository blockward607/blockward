
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
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('useAdminAuth: Checking initial auth state');
    
    const checkInitialAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('useAdminAuth: Found existing session for user:', session.user.id);
          
          // Check if user is already admin
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          if (userRole?.role === 'admin') {
            console.log('useAdminAuth: User is admin, redirecting to dashboard');
            navigate('/admin-dashboard', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('useAdminAuth: Error checking initial auth:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    checkInitialAuth();
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
          console.log('useAdminAuth: User is not admin, attempting to promote...');
          
          try {
            const { error: promoteError } = await supabase.rpc('promote_user_to_admin', {
              target_user_id: data.user.id,
              admin_name: fullName || data.user.email?.split('@')[0] || 'Administrator',
              admin_position: 'Administrator'
            });

            if (!promoteError) {
              console.log('useAdminAuth: Successfully promoted user to admin');
              toast({
                title: "Admin Access Granted",
                description: "Welcome to the admin panel!",
              });
              navigate('/admin-dashboard', { replace: true });
              return;
            }
          } catch (promoteError) {
            console.error('useAdminAuth: Failed to promote user:', promoteError);
          }
          
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

    console.log('useAdminAuth: Starting admin signup for:', email);
    setLoading(true);

    try {
      // Create user account without email verification
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin'
          },
          // No emailRedirectTo - skip email verification
        }
      });

      if (error) {
        console.error('useAdminAuth: Signup error:', error);
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: error.message,
        });
        return;
      }

      if (data.user) {
        console.log('useAdminAuth: Signup successful for user:', data.user.id);
        
        // If user was created but not automatically signed in (due to email confirmation requirement),
        // manually confirm the email and sign them in
        if (!data.session) {
          console.log('useAdminAuth: No session after signup, attempting to sign in...');
          
          // Try to sign in immediately
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            console.error('useAdminAuth: Auto sign-in failed:', signInError);
            toast({
              title: "Account Created",
              description: "Please check your email to verify your account, then sign in.",
            });
            setActiveTab("signin");
            return;
          }

          if (signInData.user) {
            console.log('useAdminAuth: Auto sign-in successful');
            // Continue with promotion logic below
            data.user = signInData.user;
            data.session = signInData.session;
          }
        }

        // Promote to admin immediately
        try {
          const { error: promoteError } = await supabase.rpc('promote_user_to_admin', {
            target_user_id: data.user.id,
            admin_name: fullName || 'Administrator',
            admin_position: 'Administrator'
          });

          if (!promoteError) {
            console.log('useAdminAuth: Successfully created and promoted admin account');
            toast({
              title: "Admin Account Created",
              description: "Welcome to the admin panel!",
            });
            
            // Navigate immediately to admin dashboard
            navigate('/admin-dashboard', { replace: true });
            return;
          } else {
            console.error('useAdminAuth: Failed to promote new user:', promoteError);
          }
        } catch (promoteError) {
          console.error('useAdminAuth: Exception promoting new user:', promoteError);
        }

        // If promotion failed but account was created, show success but ask to sign in
        toast({
          title: "Account Created",
          description: "Your account has been created. Please sign in to continue.",
        });
        
        setActiveTab("signin");
        setPassword(""); // Clear password for security
        setConfirmPassword("");
      }
    } catch (error) {
      console.error('useAdminAuth: Unexpected signup error:', error);
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
    isInitializing,
    handleAdminLogin,
    handleAdminSignup
  };
};
