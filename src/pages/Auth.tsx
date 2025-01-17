import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Diamond } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate("/dashboard");
        }
        if (event === "SIGNED_OUT") {
          setErrorMessage("You have been signed out");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth Form */}
      <div className="w-full flex items-center justify-center px-4 bg-gradient-to-b from-[#1A1F2C] to-black">
        <div className="glass-card w-full max-w-md p-8">
          <div className="flex flex-col items-center mb-8">
            <Diamond className="w-12 h-12 text-purple-500 mb-4" />
            <h2 className="text-2xl font-bold text-center gradient-text">
              Welcome to Blockward
            </h2>
          </div>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "rgb(139, 92, 246)",
                    brandAccent: "rgb(124, 58, 237)",
                  },
                },
              },
              style: {
                button: {
                  background: "rgb(139, 92, 246)",
                  borderRadius: "8px",
                  width: "100%",
                },
                input: {
                  borderRadius: "8px",
                },
                anchor: {
                  color: "rgb(139, 92, 246)",
                },
                message: {
                  color: "rgb(139, 92, 246)",
                },
              },
            }}
            providers={[]}
            redirectTo={`${window.location.origin}/dashboard`}
            view="sign_in"
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;