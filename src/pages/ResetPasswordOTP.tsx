
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { LoadingDialog } from "@/components/auth/LoadingDialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const ResetPasswordOTP = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Check for token in URL hash
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token=')) {
      // Extract the token
      const token = new URLSearchParams(hash.substring(1)).get('access_token');
      if (token) {
        // Token exists, move to password reset step
        setStep('password');
      }
    } else if (hash && hash.includes('error=')) {
      // Extract error message
      const error = new URLSearchParams(hash.substring(1)).get('error_description');
      if (error) {
        setErrorMessage(error.replace(/\+/g, ' '));
        setShowError(true);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.replace(/\+/g, ' '),
        });
        // Clear the hash
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location, navigate, toast]);

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

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    
    if (!otp || otp.length < 6) {
      setErrorMessage("Please enter a valid verification code");
      setShowError(true);
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery',
      });

      if (error) {
        setErrorMessage(error.message);
        setShowError(true);
        console.error("OTP verification error:", error);
      } else {
        setStep('password');
        toast({
          title: "OTP Verified",
          description: "You can now set a new password.",
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      setShowError(true);
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setShowError(true);
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setShowError(true);
        console.error("Password update error:", error);
      } else {
        setResetSuccess(true);
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated.",
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

  const handleGoToSignIn = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#1A1F2C] to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card p-8">
          {resetSuccess ? (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-bold">Password Updated</h2>
              <p className="text-gray-400">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Button onClick={handleGoToSignIn} className="w-full">
                Go to Sign In
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Reset Password</h2>
              
              {step === 'email' && (
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
                    onClick={handleGoToSignIn}
                  >
                    Back to Sign In
                  </Button>
                </form>
              )}
              
              {step === 'otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      We've sent a verification link to your email. After clicking the link, enter the verification code below.
                    </p>
                    <Label htmlFor="otp">Enter Verification Code</Label>
                    <InputOTP
                      value={otp}
                      onChange={(value) => setOtp(value)}
                      maxLength={6}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Verify Code
                  </Button>
                </form>
              )}
              
              {step === 'password' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Reset Password
                  </Button>
                </form>
              )}
              
              {showError && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {errorMessage}
                </div>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      <LoadingDialog open={loading} onOpenChange={setLoading} />
    </div>
  );
};

export default ResetPasswordOTP;
