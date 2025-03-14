
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PasswordStepProps {
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  setResetSuccess: (success: boolean) => void;
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const PasswordStep = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  setResetSuccess,
  setErrorMessage,
  setShowError,
  setLoading,
}: PasswordStepProps) => {
  const { toast } = useToast();

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

  return (
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
  );
};
