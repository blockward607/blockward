
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { LoadingDialog } from "@/components/auth/LoadingDialog";
import { useNavigate, useLocation } from "react-router-dom";
import { EmailStep } from "@/components/auth/reset-password/EmailStep";
import { OTPStep } from "@/components/auth/reset-password/OTPStep";
import { PasswordStep } from "@/components/auth/reset-password/PasswordStep";
import { SuccessMessage } from "@/components/auth/reset-password/SuccessMessage";
import { ErrorDisplay } from "@/components/auth/reset-password/ErrorDisplay";

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
            <SuccessMessage onGoToSignIn={handleGoToSignIn} />
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Reset Password</h2>
              
              {step === 'email' && (
                <EmailStep 
                  email={email}
                  setEmail={setEmail}
                  setStep={setStep}
                  setErrorMessage={setErrorMessage}
                  setShowError={setShowError}
                  setLoading={setLoading}
                  onBackToSignIn={handleGoToSignIn}
                />
              )}
              
              {step === 'otp' && (
                <OTPStep
                  email={email}
                  otp={otp}
                  setOtp={setOtp}
                  setStep={setStep}
                  setErrorMessage={setErrorMessage}
                  setShowError={setShowError}
                  setLoading={setLoading}
                />
              )}
              
              {step === 'password' && (
                <PasswordStep
                  password={password}
                  setPassword={setPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  setResetSuccess={setResetSuccess}
                  setErrorMessage={setErrorMessage}
                  setShowError={setShowError}
                  setLoading={setLoading}
                />
              )}
              
              <ErrorDisplay message={errorMessage} show={showError} />
            </div>
          )}
        </Card>
      </motion.div>

      <LoadingDialog open={loading} onOpenChange={setLoading} />
    </div>
  );
};

export default ResetPasswordOTP;
