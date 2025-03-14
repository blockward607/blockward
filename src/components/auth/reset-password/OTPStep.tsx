
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OTPStepProps {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  setStep: (step: 'email' | 'otp' | 'password') => void;
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const OTPStep = ({
  email,
  otp,
  setOtp,
  setStep,
  setErrorMessage,
  setShowError,
  setLoading,
}: OTPStepProps) => {
  const { toast } = useToast();

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

  return (
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
  );
};
