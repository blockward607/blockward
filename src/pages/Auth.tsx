import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { WalletSignInForm } from "@/components/auth/WalletSignInForm";
import { LoadingDialog } from "@/components/auth/LoadingDialog";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';

const AuthPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { loading, setLoading } = useAuth();
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [useCustomAuth, setUseCustomAuth] = useState(true);
  const [activeAuthTab, setActiveAuthTab] = useState("signin");
  
  useEffect(() => {
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error === 'access_denied' && errorDescription) {
      setShowError(true);
      setErrorMessage(errorDescription.replace(/\+/g, ' '));
      
      navigate(location.pathname, { replace: true });
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorDescription.replace(/\+/g, ' '),
      });
    }
  }, [location, navigate, toast]);
  
  useEffect(() => {
    const resetToken = searchParams.get('reset');
    if (resetToken) {
      navigate('/auth/reset-password', { state: { token: resetToken } });
    }
  }, [searchParams, navigate]);

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setShowError(false);
  };

  const handleBackToSignIn = () => {
    setShowForgotPassword(false);
    setShowError(false);
  };

  useEffect(() => {
    if (showError) {
      setShowError(false);
    }
  }, [email, password]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#1A1F2C] to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card p-8">
          {useCustomAuth ? (
            showForgotPassword ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
                <ForgotPasswordForm
                  email={email}
                  setEmail={setEmail}
                  setErrorMessage={setErrorMessage}
                  setShowError={setShowError}
                  setLoading={setLoading}
                  onBackToSignIn={handleBackToSignIn}
                />
              </div>
            ) : (
              <>
                <Tabs defaultValue="teacher" onValueChange={(value) => setRole(value as 'teacher' | 'student')}>
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="teacher">Teacher</TabsTrigger>
                    <TabsTrigger value="student">Student</TabsTrigger>
                  </TabsList>
                </Tabs>

                <Tabs value={activeAuthTab} onValueChange={setActiveAuthTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    <TabsTrigger value="wallet">Wallet</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin" className="space-y-4">
                    <SignInForm
                      email={email}
                      setEmail={setEmail}
                      password={password}
                      setPassword={setPassword}
                      setErrorMessage={setErrorMessage}
                      setShowError={setShowError}
                      setLoading={setLoading}
                      onForgotPasswordClick={handleForgotPasswordClick}
                    />
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <SignUpForm
                      role={role}
                      email={email}
                      setEmail={setEmail}
                      password={password}
                      setPassword={setPassword}
                      setErrorMessage={setErrorMessage}
                      setShowError={setShowError}
                      setLoading={setLoading}
                    />
                  </TabsContent>
                  
                  <TabsContent value="wallet" className="space-y-4">
                    <WalletSignInForm
                      setErrorMessage={setErrorMessage}
                      setShowError={setShowError}
                      setLoading={setLoading}
                    />
                  </TabsContent>
                </Tabs>
              </>
            )
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center mb-6">Sign In or Sign Up</h2>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={[]} // Removed Google and GitHub providers
              />
              <button 
                onClick={() => setUseCustomAuth(true)}
                className="w-full text-sm text-gray-400 hover:text-gray-200 mt-4"
              >
                Switch to Custom Auth UI
              </button>
            </div>
          )}

          {showError && (
            <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {errorMessage}
            </div>
          )}
        </Card>
      </motion.div>

      <LoadingDialog open={loading} onOpenChange={setLoading} />
    </div>
  );
};

export default AuthPage;
