
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      setErrorMessage("Please enter your email address");
      setShowError(true);
      return;
    }
    
    setLoading(true);
    setShowError(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message);
        setShowError(true);
        console.error("Password reset error:", error);
      } else {
        setEmailSent(true);
        toast({
          title: "Password reset email sent",
          description: "Check your email for a password reset link.",
        });
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
      {emailSent ? (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium">Check your email</h3>
            <p className="text-sm text-gray-500 mt-2">
              We've sent a password reset link to {email}
            </p>
          </div>
          <Button 
            onClick={onBackToSignIn} 
            variant="outline" 
            className="w-full"
          >
            Back to Sign In
          </Button>
        </div>
      ) : (
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
      )}
    </div>
  );
};
