
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SignInFormProps {
  role: 'teacher' | 'student';
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  onForgotPasswordClick: () => void;
}

export const SignInForm = ({
  role,
  email,
  setEmail,
  password,
  setPassword,
  setErrorMessage,
  setShowError,
  setLoading,
  onForgotPasswordClick,
}: SignInFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    
    // Validate email format
    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      setShowError(true);
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setShowError(true);
        console.error("Login error:", error);
      } else if (data.user) {
        // Check if the user's role matches the selected role
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (roleError) {
          console.error("Error checking user role:", roleError);
          // If we can't check the role, proceed anyway
          navigate('/dashboard', { replace: true });
        } else if (userRole) {
          // NEW: Handle admin role redirection
          if (userRole.role === 'admin') {
            navigate('/admin', { replace: true });
          } else if (userRole.role !== role) {
            setErrorMessage(`This account is registered as a ${userRole.role}. Please select the correct role.`);
            setShowError(true);
            // Sign out the user since role doesn't match
            await supabase.auth.signOut();
          } else {
            // Navigate to appropriate dashboard based on role
            navigate('/dashboard', { replace: true });
          }
        } else {
          // Navigate directly to dashboard if no role data found
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-400">
          Signing in as <span className="text-purple-400 font-medium">{role}</span>
        </p>
      </div>
      
      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Sign In as {role === 'teacher' ? 'Teacher' : 'Student'}
        </Button>
        <div className="text-center mt-4">
          <button 
            type="button"
            onClick={onForgotPasswordClick}
            className="text-sm text-purple-400 hover:text-purple-300 underline"
          >
            Forgot your password?
          </button>
        </div>
      </form>
    </div>
  );
};
