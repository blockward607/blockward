import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate("/dashboard");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#1A1F2C] to-black">
      <div className="glass-card w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center mb-8 gradient-text">
          Welcome to Blockward
        </h2>
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
              },
              input: {
                borderRadius: "8px",
              },
            },
          }}
          providers={["google"]}
          redirectTo={`${window.location.origin}/dashboard`}
        />
      </div>
    </div>
  );
};

export default Auth;