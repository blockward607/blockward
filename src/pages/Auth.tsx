import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Diamond, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  // Function to inject password visibility toggle
  useEffect(() => {
    const injectPasswordToggle = () => {
      const passwordInput = document.querySelector('input[type="password"]');
      if (passwordInput) {
        const container = passwordInput.parentElement;
        if (container && !container.querySelector('.password-toggle')) {
          const toggleButton = document.createElement('button');
          toggleButton.type = 'button';
          toggleButton.className = 'password-toggle absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700';
          toggleButton.innerHTML = showPassword ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
          
          toggleButton.onclick = () => {
            setShowPassword(!showPassword);
            passwordInput.type = showPassword ? 'password' : 'text';
          };
          
          container.style.position = 'relative';
          container.appendChild(toggleButton);
        }
      }
    };

    // Add observer to handle dynamic content
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