
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, UserCheck, School, Loader2 } from "lucide-react";

const AdminSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAlreadyAdmin, setIsAlreadyAdmin] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    position: "Administrator"
  });

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please sign in to access admin setup"
        });
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Check if user is already admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (userRole?.role === 'admin') {
        setIsAlreadyAdmin(true);
        toast({
          title: "Admin Access Detected",
          description: "You already have admin privileges"
        });
      }

    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const promoteToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setLoading(true);

    try {
      // Call the promote function
      const { data, error } = await supabase.rpc('promote_user_to_admin', {
        target_user_id: user.id,
        admin_name: formData.fullName || user.email?.split('@')[0] || 'Administrator',
        admin_position: formData.position
      });

      if (error) throw error;

      toast({
        title: "Admin Account Created!",
        description: "You now have admin privileges. Redirecting to admin dashboard..."
      });

      // Wait a moment then redirect
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "Failed to create admin account"
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isAlreadyAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-green-600/20">
                <UserCheck className="w-8 h-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl text-white">Admin Access Active</CardTitle>
              <CardDescription className="text-gray-300">
                You already have administrator privileges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate('/admin')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Go to Admin Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full"
              >
                Return to Main Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-purple-600/20">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <CardTitle className="text-2xl text-white">Admin Account Setup</CardTitle>
            <CardDescription className="text-gray-300">
              Set up your administrator account to manage the school system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={promoteToAdmin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-700 border-gray-600 text-gray-300"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    This will be your admin login email
                  </p>
                </div>

                <div>
                  <Label htmlFor="fullName" className="text-gray-200">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="position" className="text-gray-200">Position/Title</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g., Principal, Administrator"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <School className="w-5 h-5 text-blue-400" />
                  <h4 className="text-blue-300 font-medium">Admin Privileges</h4>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Manage teachers and students</li>
                  <li>• Configure school settings</li>
                  <li>• View analytics and reports</li>
                  <li>• Manage NFT rewards system</li>
                  <li>• Send announcements</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Admin Account...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Create Admin Account
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-400 hover:text-white"
                >
                  Return to Dashboard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminSetup;
