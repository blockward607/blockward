
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SignInFormProps {
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
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setErrorMessage(error.message);
        setShowError(true);
      } else if (data.user) {
        console.log('Sign in successful for user:', data.user.id);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
        // Navigate to dashboard - the auth provider will handle role-based redirection
        navigate('/dashboard', { replace: true });
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
          Sign In
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
