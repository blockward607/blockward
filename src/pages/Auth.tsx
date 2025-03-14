
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { LoadingDialog } from "@/components/auth/LoadingDialog";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useSearchParams } from "react-router-dom";

const Auth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, setLoading } = useAuth();
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Check if coming from password reset link
  useEffect(() => {
    const resetToken = searchParams.get('reset');
    if (resetToken) {
      navigate('/auth/reset-password', { state: { token: resetToken } });
    }
  }, [searchParams, navigate]);

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setShowError(false); // Clear any previous errors
  };

  const handleBackToSignIn = () => {
    setShowForgotPassword(false);
    setShowError(false); // Clear any previous errors
  };

  // Clear error when input changes
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
          {showForgotPassword ? (
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

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
              </Tabs>
            </>
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

export default Auth;
