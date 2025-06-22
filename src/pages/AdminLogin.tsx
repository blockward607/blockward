
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { AdminLoginHeader } from "@/components/admin/AdminLoginHeader";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminSignUpForm } from "@/components/admin/AdminSignUpForm";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    loading,
    activeTab,
    setActiveTab,
    isInitializing,
    handleAdminLogin,
    handleAdminSignup
  } = useAdminAuth();

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900/50 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-red-300 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900/50 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4 text-red-400 hover:text-red-300 hover:bg-red-950/30"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <Card className="bg-red-950/30 backdrop-blur-lg border-red-500/30 shadow-2xl shadow-red-900/20">
          <AdminLoginHeader />

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-red-900/30 border border-red-700/30">
                <TabsTrigger 
                  value="signin" 
                  className="text-red-300 data-[state=active]:text-white data-[state=active]:bg-red-600/40"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="text-red-300 data-[state=active]:text-white data-[state=active]:bg-red-600/40"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <AdminLoginForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  loading={loading}
                  onSubmit={handleAdminLogin}
                />
              </TabsContent>

              <TabsContent value="signup">
                <AdminSignUpForm
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  fullName={fullName}
                  setFullName={setFullName}
                  loading={loading}
                  onSubmit={handleAdminSignup}
                />
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
              >
                ← Regular user login
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
