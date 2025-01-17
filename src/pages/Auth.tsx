import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate("/dashboard");
        }
        // Handle specific auth events and errors
        if (event === "SIGNED_OUT") {
          setErrorMessage("You have been signed out");
        }
      }
    );

    // Listen for auth errors
    const handleAuthError = (error: any) => {
      if (error?.message?.includes("User already registered")) {
        toast({
          variant: "destructive",
          title: "Account exists",
          description: "This email is already registered. Please sign in instead.",
        });
      } else if (error?.message?.includes("Invalid login credentials")) {
        toast({
          variant: "destructive",
          title: "Invalid credentials",
          description: "Please check your email and password and try again.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message || "An error occurred during authentication.",
        });
      }
    };

    // Add error listener
    window.addEventListener("supabase.error", handleAuthError);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("supabase.error", handleAuthError);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 bg-gradient-to-b from-[#1A1F2C] to-black">
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

      {/* Right side - Image */}
      <div className="hidden md:block md:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7"
          alt="Code background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col justify-center items-center h-full text-white px-8">
            <h1 className="text-4xl font-bold mb-4 text-center">
              Manage Your Classroom Seating
            </h1>
            <p className="text-lg text-center text-gray-200 max-w-md">
              A simple and efficient way to organize and track classroom seating arrangements
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;