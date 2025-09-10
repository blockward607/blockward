
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, GraduationCap, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SignInFormProps {
  role: 'teacher' | 'student' | 'admin';
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  onForgotPasswordClick: () => void;
}

export const SignInForm = ({
  role,
  email,
  setEmail,
  password,
  setPassword,
  setErrorMessage,
  setShowError,
  setLoading,
  onForgotPasswordClick,
}: SignInFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLocalLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim()) {
      setErrorMessage("Email is required");
      setShowError(true);
      return;
    }
    
    if (!password.trim()) {
      setErrorMessage("Password is required");
      setShowError(true);
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address");
      setShowError(true);
      return;
    }
    
    setLocalLoading(true);
    setLoading(true);
    setShowError(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setShowError(true);
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error.message,
        });
        return;
      }

      if (data.user) {
        // Check if user role matches selected role (but don't block admin access)
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (userRole?.role !== role) {
          // Only show warning, don't block access
          toast({
            title: `Signed in as ${userRole?.role || 'user'}`,
            description: `Note: You selected ${role} but your account role is ${userRole?.role || 'unknown'}`,
          });
        } else {
          toast({
            title: "Sign in successful",
            description: `Welcome back, ${role}!`,
          });
        }

        // Navigate based on actual user role, not selected role
        if (userRole?.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrorMessage(errorMessage);
      setShowError(true);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: errorMessage,
      });
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'teacher':
        return <User className="w-5 h-5" />;
      case 'student':
        return <GraduationCap className="w-5 h-5" />;
      case 'admin':
        return <Shield className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'teacher':
        return 'indigo';
      case 'student':
        return 'purple';
      case 'admin':
        return 'red';
      default:
        return 'purple';
    }
  };

  const roleColor = getRoleColor();

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${roleColor}-600/20 border border-${roleColor}-500/30`}>
          {getRoleIcon()}
          <span className={`text-${roleColor}-300 capitalize`}>Signing in as {role}</span>
        </div>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className={`w-full bg-gradient-to-r from-${roleColor}-600 to-${roleColor}-700 hover:from-${roleColor}-700 hover:to-${roleColor}-800 text-white`}
          disabled={loading}
        >
          Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className="text-sm text-gray-400 hover:text-gray-300 underline"
        >
          Forgot your password?
        </button>
      </div>
    </div>
  );
};
