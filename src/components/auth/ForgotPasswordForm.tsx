
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ErrorDisplay } from "@/components/auth/reset-password/ErrorDisplay";
import { EmailStep } from "@/components/auth/reset-password/EmailStep";
import { LoadingDialog } from "@/components/auth/LoadingDialog";

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
  const [localLoading, setLocalLoading] = useState(false);
  
  const handleResetPassword = (e: React.FormEvent) => {
    setShowError(false);
    navigate('/auth/reset-password-otp');
  };

  return (
    <div className="space-y-4">
      <EmailStep
        email={email}
        setEmail={setEmail}
        setStep={() => {}} // Not needed for this component
        setErrorMessage={setErrorMessage}
        setShowError={setShowError}
        setLoading={setLoading}
        onBackToSignIn={onBackToSignIn}
      />
      
      <ErrorDisplay message={setErrorMessage} show={setShowError} />
      
      <LoadingDialog open={localLoading} onOpenChange={setLocalLoading} />
    </div>
  );
};
