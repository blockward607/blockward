
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailStepProps {
  email: string;
  setEmail: (email: string) => void;
  setStep: (step: 'email' | 'otp' | 'password') => void;
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  onBackToSignIn: () => void;
}

export const EmailStep = ({
  email,
  setEmail,
  setStep,
  setErrorMessage,
  setShowError,
  setLoading,
  onBackToSignIn,
}: EmailStepProps) => {
  const { toast } = useToast();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    
    if (!email || !email.trim()) {
      setErrorMessage("Please enter your email address");
      setShowError(true);
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password-otp`,
      });

      if (error) {
        setErrorMessage(error.message);
        setShowError(true);
        console.error("OTP request error:", error);
      } else {
        setStep('otp');
        toast({
          title: "Email Sent",
          description: "Check your email for a verification link. Click it and then enter the verification code here.",
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
    <form onSubmit={handleSendOTP} className="space-y-4">
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
      
      <Button type="submit" className="w-full">
        Send Verification Link
      </Button>
      
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onBackToSignIn}
      >
        Back to Sign In
      </Button>
    </form>
  );
};
