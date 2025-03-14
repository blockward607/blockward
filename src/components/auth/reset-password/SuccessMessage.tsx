
import { Button } from "@/components/ui/button";

interface SuccessMessageProps {
  onGoToSignIn: () => void;
}

export const SuccessMessage = ({ onGoToSignIn }: SuccessMessageProps) => {
  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold">Password Updated</h2>
      <p className="text-gray-400">
        Your password has been successfully reset. You can now sign in with your new password.
      </p>
      <Button onClick={onGoToSignIn} className="w-full">
        Go to Sign In
      </Button>
    </div>
  );
};
