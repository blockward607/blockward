
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GoogleSignUpButtonProps {
  role: 'teacher' | 'student';
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const GoogleSignUpButton = ({
  role,
  setErrorMessage,
  setShowError,
  setLoading,
}: GoogleSignUpButtonProps) => {
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setShowError(false);
    setGoogleLoading(true);
    setLoading(true);
    
    try {
      console.log(`Initiating Google sign-up with role: ${role}`);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            role: role
          }
        }
      });

      if (error) {
        setErrorMessage(error.message);
        setShowError(true);
        console.error("Google sign-up error:", error);
      } else {
        console.log("Google sign-up initiated successfully:", data);
      }
    } catch (error: any) {
      console.error("Unexpected error during Google sign-up:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowError(true);
    } finally {
      setGoogleLoading(false);
      // Don't set loading to false here as the user will be redirected
    }
  };

  return (
    <Button 
      type="button" 
      variant="outline" 
      className="w-full py-6 flex items-center justify-center gap-2"
      onClick={handleGoogleSignUp}
      disabled={googleLoading}
    >
      {googleLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Connecting to Google...</span>
        </>
      ) : (
        <>
          <FcGoogle className="w-5 h-5" />
          <span>Continue with Google</span>
        </>
      )}
    </Button>
  );
};
