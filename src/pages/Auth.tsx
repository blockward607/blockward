
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Auth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        if (session) {
          // Check if role exists already
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

          if (!existingRole) {
            // Add role to user_roles table
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert([{ user_id: session.user.id, role }]);

            if (roleError) {
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to set user role",
              });
              console.error("Role assignment error:", roleError);
              return;
            }
          }

          // Create wallet if not exists - We'll do this manually instead of relying on the trigger
          const { data: existingWallet } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!existingWallet) {
            // Generate a random hex address without using DB functions
            const randomAddress = `0x${Array.from({length: 40}, () => 
              Math.floor(Math.random() * 16).toString(16)).join('')}`;
              
            const { error: walletError } = await supabase
              .from('wallets')
              .insert([{
                user_id: session.user.id,
                address: randomAddress,
                type: role === 'teacher' ? 'admin' : 'user'
              }]);

            if (walletError) {
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create wallet",
              });
              console.error("Wallet creation error:", walletError);
              return;
            }
          }

          // Create teacher profile if needed
          if (role === 'teacher') {
            const { data: existingProfile } = await supabase
              .from('teacher_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (!existingProfile) {
              const { error: profileError } = await supabase
                .from('teacher_profiles')
                .insert([{ user_id: session.user.id }]);

              if (profileError) {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Failed to create teacher profile",
                });
                console.error("Teacher profile error:", profileError);
                return;
              }
            }
          } else {
            // For students, create a student record
            const { data: existingStudent } = await supabase
              .from('students')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();
              
            if (!existingStudent) {
              // Use email as name if no other info available
              const studentName = email.split('@')[0];
              
              const { error: studentError } = await supabase
                .from('students')
                .insert([{ 
                  user_id: session.user.id,
                  name: studentName
                }]);
                
              if (studentError) {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: "Failed to create student profile",
                });
                console.error("Student profile error:", studentError);
                return;
              }
            }
          }

          toast({
            title: "Welcome!",
            description: "You have successfully signed in.",
          });
          navigate('/dashboard');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, role, email]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowError(false);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role // Include role in metadata
          }
        }
      });

      if (error) {
        setErrorMessage(error.message);
        setShowError(true);
        console.error("Signup error:", error);
      } else if (data) {
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowError(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setShowError(true);
        console.error("Login error:", error);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#1A1F2C] to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card p-8">
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
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {showError && (
            <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {errorMessage}
            </div>
          )}
        </Card>
      </motion.div>

      <Dialog open={loading} onOpenChange={setLoading}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Processing...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
