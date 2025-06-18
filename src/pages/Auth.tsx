
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { useAuth } from "@/hooks/use-auth";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      // If user is authenticated, redirect to dashboard
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check if there's a join code in the location state
    if (location.state?.joinCode) {
      console.log("Found join code in auth page:", location.state.joinCode);
      // Store the join code for after authentication
      localStorage.setItem('pendingJoinCode', location.state.joinCode);
    }
  }, [location.state]);

  // Clear error when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowError(false);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text">BlockWard</h1>
            <p className="text-gray-400 mt-2">Welcome to the future of education</p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <SignInForm 
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                setErrorMessage={setErrorMessage}
                setShowError={setShowError}
                setLoading={setLoading}
                onForgotPasswordClick={() => setActiveTab("forgot")} 
              />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignUpForm 
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

          {activeTab === "forgot" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ForgotPasswordForm 
                email={email}
                setEmail={setEmail}
                setErrorMessage={setErrorMessage}
                setShowError={setShowError}
                setLoading={setLoading}
                onBackToSignIn={() => setActiveTab("signin")} 
              />
            </motion.div>
          )}

          {showError && (
            <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {errorMessage}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
