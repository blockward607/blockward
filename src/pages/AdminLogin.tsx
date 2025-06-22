
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AdminLoginHeader } from "@/components/admin/AdminLoginHeader";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleAdminLogin,
  } = useAdminAuth();

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
            <AdminLoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              onSubmit={handleAdminLogin}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
