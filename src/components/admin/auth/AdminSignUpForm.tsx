
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "./useAdminAuth";

export const AdminSignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setShowError, setErrorMessage } = useAdminAuth();

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

  return (
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
  );
};
