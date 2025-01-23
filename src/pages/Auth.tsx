import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_IN" && session) {
          toast({
            title: "Welcome back!",
            description: "Successfully signed in.",
          });
          navigate("/dashboard");
        }
        if (event === "SIGNED_OUT") {
          setErrorMessage("You have been signed out");
        }
        if (event === "USER_UPDATED") {
          console.log("User updated:", session);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  // Inject password toggle button
  useEffect(() => {
    const injectPasswordToggle = () => {
      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
      if (passwordInput) {
        const container = passwordInput.parentElement;
        if (container && !container.querySelector('.password-toggle')) {
          const toggleButton = document.createElement('button');
          toggleButton.type = 'button';
          toggleButton.className = 'password-toggle absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700';
          toggleButton.innerHTML = showPassword ? 
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>' : 
            '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
          
          toggleButton.onclick = () => {
            setShowPassword(!showPassword);
            passwordInput.type = showPassword ? 'password' : 'text';
          };
          
          container.style.position = 'relative';
          container.appendChild(toggleButton);
        }
      }
    };

    const observer = new MutationObserver(() => {
      injectPasswordToggle();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [showPassword]);

  return (
    <div className="min-h-screen flex">
      <div className="w-full flex flex-col items-center justify-center px-4 bg-gradient-to-b from-[#1A1F2C] to-black">
        <Button
          variant="ghost"
          className="absolute top-4 left-4 text-white hover:text-purple-400"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <div className="glass-card w-full max-w-md p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-center gradient-text mb-2">
              Welcome to Blockward
            </h2>
            <p className="text-gray-400 text-center text-sm">
              Your Digital Education Wallet
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-purple-900/20 rounded-lg mb-4">
              <h3 className="text-sm font-medium text-purple-300 mb-2">
                🎯 For Educators
              </h3>
              <p className="text-xs text-gray-400">
                Create and manage digital rewards, track student progress, and distribute achievements securely.
              </p>
            </div>

            <SupabaseAuth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "rgb(139, 92, 246)",
                      brandAccent: "rgb(124, 58, 237)",
                      inputText: "white",
                      inputBackground: "rgba(255, 255, 255, 0.1)",
                      inputBorder: "rgba(255, 255, 255, 0.2)",
                      inputLabelText: "rgb(209, 213, 219)",
                      inputPlaceholder: "rgba(255, 255, 255, 0.5)",
                    },
                  },
                },
                style: {
                  button: {
                    background: "rgb(139, 92, 246)",
                    borderRadius: "8px",
                    color: "white",
                    width: "100%",
                    padding: "10px",
                    fontWeight: "500",
                    textTransform: "none",
                  },
                  button_hover: { // Changed from &:hover
                    background: "rgb(124, 58, 237)",
                  },
                  input: {
                    borderRadius: "8px",
                    padding: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                  },
                  input_placeholder: { // Changed from &::placeholder
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                  input_focus: { // Added separate focus style
                    borderColor: "rgb(139, 92, 246)",
                    outline: "none",
                  },
                  label: {
                    color: "rgb(209, 213, 219)",
                    fontSize: "0.875rem",
                    marginBottom: "0.5rem",
                  },
                  anchor: {
                    color: "rgb(139, 92, 246)",
                  },
                  anchor_hover: { // Changed from &:hover
                    color: "rgb(124, 58, 237)",
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
    </div>
  );
};

export default Auth;