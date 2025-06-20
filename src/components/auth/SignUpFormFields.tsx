
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, GraduationCap, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SignUpFormFieldsProps {
  role: 'teacher' | 'student' | 'admin';
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const SignUpFormFields = ({
  role,
  email,
  setEmail,
  password,
  setPassword,
  setErrorMessage,
  setShowError,
  setLoading,
}: SignUpFormFieldsProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [school, setSchool] = useState("");
  const [subject, setSubject] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowError(false);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setShowError(true);
      setLoading(false);
      return;
    }

    try {
      const signUpData = {
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            school: school,
            ...(role === 'teacher' && { subject: subject }),
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      };

      const { data, error } = await supabase.auth.signUp(signUpData);

      if (error) {
        setErrorMessage(error.message);
        setShowError(true);
        return;
      }

      if (data.user) {
        // Create user role entry
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: role
        });

        toast({
          title: "Account Created!",
          description: `Your ${role} account has been created. Please check your email to verify your account.`,
        });

        // Redirect based on role after successful signup
        if (role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setErrorMessage("An unexpected error occurred during signup");
      setShowError(true);
    } finally {
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
          <span className={`text-${roleColor}-300 capitalize`}>Creating {role} account</span>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="school" className="text-gray-300">School/Institution</Label>
          <Input
            id="school"
            type="text"
            placeholder="Enter your school name"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>

        {role === 'teacher' && (
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-gray-300">Subject/Department</Label>
            <Input
              id="subject"
              type="text"
              placeholder="e.g., Mathematics, English, Science"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
          <div className="relative">
            <Input
              id="signup-password"
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

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>

        <Button
          type="submit"
          className={`w-full bg-gradient-to-r from-${roleColor}-600 to-${roleColor}-700 hover:from-${roleColor}-700 hover:to-${roleColor}-800 text-white`}
          disabled={setLoading}
        >
          Create {role.charAt(0).toUpperCase() + role.slice(1)} Account
        </Button>
      </form>
    </div>
  );
};
