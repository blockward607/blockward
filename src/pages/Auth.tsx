
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
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { GraduationCap, Sparkles } from "lucide-react";

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
  
  // Check for token errors in URL hash
  useEffect(() => {
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error === 'access_denied' && errorDescription) {
      setShowError(true);
      setErrorMessage(errorDescription.replace(/\+/g, ' '));
      
      // Clear the hash from URL to prevent showing the error again on refresh
      navigate(location.pathname, { replace: true });
      
      // Show a toast for better visibility
      toast({
        variant: "destructive",
        title: "Error",
        description: errorDescription.replace(/\+/g, ' '),
      });
    }
  }, [location, navigate, toast]);
  
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#1A1F2C] to-black overflow-hidden relative">
      {/* Luxury background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] right-[15%] w-72 h-72 bg-purple-600/20 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-[20%] left-[10%] w-64 h-64 bg-indigo-600/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-[40%] left-[20%] w-40 h-40 hexagon bg-purple-500/10 filter blur-xl"></div>
        
        {/* Animated particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-300/40 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Luxury Logo */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <GraduationCap className="w-16 h-16 text-purple-400" />
            <motion.div
              className="absolute -top-2 -right-2 text-yellow-300"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1 
          className="text-3xl font-bold text-center mb-6 shimmer-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Blockward Premium
        </motion.h1>

        <Card className="glass-card p-8 border-purple-500/40 shadow-2xl backdrop-blur-xl bg-black/60 animate-pulse-glow">
          {showForgotPassword ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center mb-6 gradient-text">Reset Password</h2>
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
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-purple-900/20 border border-purple-500/30">
                  <TabsTrigger value="teacher" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Teacher</TabsTrigger>
                  <TabsTrigger value="student" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Student</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-purple-900/20 border border-purple-500/30">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Sign Up</TabsTrigger>
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
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              {errorMessage}
            </motion.div>
          )}
        </Card>
      </motion.div>

      <LoadingDialog open={loading} onOpenChange={setLoading} />
    </div>
  );
};

export default AuthPage;
