
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const AdminAuth = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkUserRoleAndRedirect();
    }
  }, [user, navigate]);

  const checkUserRoleAndRedirect = async () => {
    if (!user) return;
    
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData?.role === 'admin') {
        navigate('/admin-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const resetFormState = () => {
    setLoading(false);
    setShowError(false);
    setErrorMessage("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowError(false);
    setErrorMessage("");

    try {
      console.log('Attempting admin sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        setErrorMessage(error.message);
        setShowError(true);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('Sign in successful, checking admin role...');
        
        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (roleError) {
          console.error('Error checking role:', roleError);
          setErrorMessage("Error verifying admin privileges.");
          setShowError(true);
          setLoading(false);
          await supabase.auth.signOut();
          return;
        }

        if (roleData?.role === 'admin') {
          toast({
            title: "Admin Login Successful",
            description: "Welcome to the admin portal"
          });
          // Navigation will be handled by auth state change
        } else {
          setErrorMessage("Access denied. Admin privileges required.");
          setShowError(true);
          setLoading(false);
          await supabase.auth.signOut();
        }
      }
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowError(true);
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowError(false);
    setErrorMessage("");

    try {
      console.log('Attempting admin sign up for:', email);
      
      if (!name.trim()) {
        setErrorMessage("Admin name is required.");
        setShowError(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin',
            name: name.trim(),
            full_name: name.trim()
          },
          emailRedirectTo: window.location.origin + '/admin-portal'
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        setErrorMessage(error.message);
        setShowError(true);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('Admin signup successful:', data.user.id);
        toast({
          title: "Admin Account Created",
          description: "Please check your email to confirm your admin account. You will be redirected to the admin portal upon confirmation.",
        });
        
        // Reset form
        setEmail("");
        setPassword("");
        setName("");
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowError(true);
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="mb-4 text-red-400 hover:text-red-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
        
        <Card className="glass-card p-8 border-red-500/30 bg-gray-900/80">
          <div className="flex justify-center mb-6">
            <Shield className="h-12 w-12 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2 text-white">Administrator Portal</h2>
          <p className="text-center text-red-300 mb-6">Secure admin access only</p>
          
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            resetFormState();
          }}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-red-900/50">
              <TabsTrigger value="signin" className="data-[state=active]:bg-red-600 text-red-200">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-red-600 text-red-200">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-white">Admin Email</Label>
                  <Input 
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-gray-800/50 border-red-500/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-white">Password</Label>
                  <Input 
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-gray-800/50 border-red-500/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white" 
                  disabled={loading}
                >
                  {loading ? "Authenticating..." : "Access Admin Portal"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-name" className="text-white">Admin Name</Label>
                  <Input 
                    id="admin-name"
                    type="text"
                    placeholder="Administrator Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-gray-800/50 border-red-500/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-signup-email" className="text-white">Admin Email</Label>
                  <Input 
                    id="admin-signup-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-gray-800/50 border-red-500/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-signup-password" className="text-white">Password</Label>
                  <Input 
                    id="admin-signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-gray-800/50 border-red-500/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 text-white" 
                  disabled={loading}
                >
                  {loading ? "Creating Admin Account..." : "Create Admin Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {showError && (
            <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errorMessage}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminAuth;
