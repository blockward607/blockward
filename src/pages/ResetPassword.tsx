
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { LoadingDialog } from "@/components/auth/LoadingDialog";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Get token from location state
  const token = location.state?.token;

  useEffect(() => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired.",
      });
      navigate('/auth');
    }
  }, [token, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    
    // Validate password
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      setShowError(true);
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setShowError(true);
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setErrorMessage(error.message);
        setShowError(true);
        console.error("Password reset error:", error);
      } else {
        setResetSuccess(true);
        toast({
          title: "Password updated",
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

  // If token is not available, don't render the form
  if (!token && !resetSuccess) {
    return null;
  }

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
              <h2 className="text-2xl font-bold text-center">Set New Password</h2>
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
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoToSignIn}
                >
                  Back to Sign In
                </Button>
              </form>
              
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

export default ResetPassword;
