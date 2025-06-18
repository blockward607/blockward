
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SignUpFormFieldsProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const SignUpFormFields = ({
  email,
  setEmail,
  password,
  setPassword,
  setErrorMessage,
  setShowError,
  setLoading,
}: SignUpFormFieldsProps) => {
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [name, setName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    
    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address");
      setShowError(true);
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      setShowError(true);
      return;
    }

    if (!name.trim()) {
      setErrorMessage("Please enter your full name");
      setShowError(true);
      return;
    }
    
    setLoading(true);

    try {
      console.log('Starting signup process for:', email, 'with role:', role);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            name: name.trim(),
            full_name: name.trim()
          }
        }
      });

      if (error) {
        console.error("Sign up error:", error);
        setErrorMessage(error.message);
        setShowError(true);
      } else if (data.user) {
        console.log('Signup successful for user:', data.user.id);
        
        // Don't wait for account setup - show success immediately
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account.",
        });
        
        // Clear form
        setEmail("");
        setPassword("");
        setName("");
        
        // Navigate to auth page to show confirmation
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      }
    } catch (error) {
      console.error("Unexpected signup error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Role Selection */}
      <div className="space-y-2">
        <Label>I am a:</Label>
        <div className="flex rounded-lg overflow-hidden">
          <button
            type="button"
            className={`flex-1 py-3 text-center font-medium transition-all ${
              role === 'teacher'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setRole('teacher')}
          >
            Teacher
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-center font-medium transition-all ${
              role === 'student'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setRole('student')}
          >
            Student
          </button>
        </div>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
    </div>
  );
};
