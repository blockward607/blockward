import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CSSProperties } from "react";
import { useToast } from "@/hooks/use-toast";

const customTheme = {
  default: {
    colors: {
      brand: "rgb(139, 92, 246)",
      brandAccent: "rgb(124, 58, 237)",
      inputBackground: "rgba(255, 255, 255, 0.1)",
      inputBorder: "rgba(255, 255, 255, 0.2)",
      inputText: "white",
      inputPlaceholder: "rgba(255, 255, 255, 0.5)",
      messageText: "rgb(139, 92, 246)",
      anchorTextColor: "rgb(139, 92, 246)",
      dividerBackground: "rgba(255, 255, 255, 0.2)",
    },
    space: {
      buttonPadding: "10px",
      inputPadding: "10px",
    },
    borderWidths: {
      buttonBorderWidth: "1px",
      inputBorderWidth: "1px",
    },
    radii: {
      borderRadiusButton: "8px",
      buttonBorderRadius: "8px",
      inputBorderRadius: "8px",
    },
    fontSizes: {
      baseButtonSize: "14px",
      baseInputSize: "14px",
      baseLabelSize: "14px",
    },
    fonts: {
      bodyFontFamily: "inherit",
      buttonFontFamily: "inherit",
      inputFontFamily: "inherit",
      labelFontFamily: "inherit",
    },
  },
};

const authContainerStyles: {
  container?: CSSProperties;
  button?: CSSProperties;
  input?: CSSProperties;
  label?: CSSProperties;
  anchor?: CSSProperties;
  message?: CSSProperties;
  divider?: CSSProperties;
} = {
  container: {
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
  },
  button: {
    backgroundColor: "rgb(139, 92, 246)",
    color: "white",
    padding: "10px",
    fontWeight: "500",
    textTransform: "none" as const,
    transition: "background-color 0.2s ease",
  },
  input: {
    borderRadius: "8px",
    padding: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "white",
    transition: "border-color 0.2s ease",
  },
  label: {
    color: "rgb(209, 213, 219)",
    fontSize: "14px",
    marginBottom: "4px",
  },
  anchor: {
    color: "rgb(139, 92, 246)",
    transition: "color 0.2s ease",
  },
  message: {
    color: "rgb(139, 92, 246)",
  },
  divider: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
};

const Auth = () => {
  const { toast } = useToast();

  // Handle auth state change
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
    } else if (event === 'SIGNED_OUT') {
      toast({
        title: "Signed out",
        description: "You have been signed out.",
      });
    } else if (event === 'USER_UPDATED') {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated.",
      });
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card p-8">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: customTheme,
              style: authContainerStyles,
            }}
            theme="dark"
            providers={[]}
            redirectTo={`${window.location.origin}/dashboard`}
            localization={{
              variables: {
                sign_up: {
                  email_input_placeholder: "Choose a username",
                  password_input_placeholder: "Create a password (min. 6 characters)",
                  email_label: "Username",
                  password_label: "Password",
                  button_label: "Sign up",
                },
                sign_in: {
                  email_input_placeholder: "Enter your username",
                  password_input_placeholder: "Enter your password",
                  email_label: "Username",
                  password_label: "Password",
                  button_label: "Sign in",
                }
              },
            }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;