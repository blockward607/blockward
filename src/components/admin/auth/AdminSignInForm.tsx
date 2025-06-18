
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "./useAdminAuth";

export const AdminSignInForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setShowError, setErrorMessage } = useAdminAuth();

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

  return (
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
  );
};
