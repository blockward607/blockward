import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  onBackToSignIn: () => void;
}

export const ForgotPasswordForm = ({
  email,
  setEmail,
  setErrorMessage,
  setShowError,
  setLoading,
  onBackToSignIn,
}: ForgotPasswordFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    
    if (!email || !email.trim()) {
      setErrorMessage("Please enter your email address");
      setShowError(true);
      return;
    }
    
    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      setShowError(true);
      return;
    }
    
    setLoading(true);

    try {
      navigate('/auth/reset-password-otp');
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
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email</Label>
          <Input 
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Reset Password
        </Button>
        <Button 
          onClick={onBackToSignIn} 
          variant="outline" 
          className="w-full"
        >
          Back to Sign In
        </Button>
      </form>
    </div>
  );
};
