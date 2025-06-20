
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Mail, Lock, UserPlus, ArrowLeft } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (userRole?.role === 'admin') {
        navigate('/admin-dashboard');
      }
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
        return;
      }

      if (data.user) {
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (roleError || !userRole) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Unable to verify admin privileges",
          });
          await supabase.auth.signOut();
          return;
        }

        if (userRole.role !== 'admin') {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Admin privileges required to access this panel",
          });
          await supabase.auth.signOut();
          return;
        }

        toast({
          title: "Welcome to Admin Panel",
          description: "Successfully authenticated as administrator",
        });

        navigate('/admin-dashboard');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during login",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "Passwords do not match",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin'
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: error.message,
        });
        return;
      }

      if (data.user) {
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'admin'
        });

        toast({
          title: "Admin Account Created",
          description: "Please check your email to verify your account, then sign in.",
        });
        
        setActiveTab("signin");
      }
    } catch (error) {
      toast({
        variant: "destructive", 
        title: "Error",
        description: "An unexpected error occurred during signup",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-r from-red-600/30 to-red-800/30 border border-red-500/40">
                <Shield className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Admin Portal
            </CardTitle>
            <p className="text-red-300">
              Secure administrator access to BlockWard
            </p>
          </CardHeader>

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
                <form onSubmit={handleAdminLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-red-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Administrator Email
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@blockward.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-red-900/20 border-red-700/50 text-white placeholder:text-red-400/70 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-red-300 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-red-900/20 border-red-700/50 text-white placeholder:text-red-400/70 pr-10 focus:border-red-500 focus:ring-red-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium h-11 shadow-lg shadow-red-900/25"
                  >
                    {loading ? "Authenticating..." : "Access Admin Panel"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleAdminSignup} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-red-300 flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="full-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="bg-red-900/20 border-red-700/50 text-white placeholder:text-red-400/70 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-red-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="admin@blockward.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-red-900/20 border-red-700/50 text-white placeholder:text-red-400/70 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-red-300 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-red-900/20 border-red-700/50 text-white placeholder:text-red-400/70 pr-10 focus:border-red-500 focus:ring-red-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-red-300 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-red-900/20 border-red-700/50 text-white placeholder:text-red-400/70 pr-10 focus:border-red-500 focus:ring-red-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium h-11 shadow-lg shadow-red-900/25"
                  >
                    {loading ? "Creating Account..." : "Create Admin Account"}
                  </Button>
                </form>
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
