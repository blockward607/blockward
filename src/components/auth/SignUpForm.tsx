import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
import { Separator } from "@/components/ui/separator";

interface SignUpFormProps {
  role: 'teacher' | 'student';
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const SignUpForm = ({
  role,
  email,
  setEmail,
  password,
  setPassword,
  setErrorMessage,
  setShowError,
  setLoading,
}: SignUpFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [country, setCountry] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowError(false);

    if (!name) {
      setErrorMessage("Please enter your name");
      setShowError(true);
      setLoading(false);
      return;
    }

    if (!schoolName) {
      setErrorMessage("Please enter your school name");
      setShowError(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            name: name,
            school: schoolName,
            country: country
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

  const handleGoogleSignUp = async () => {
    setShowError(false);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            role: role
          }
        }
      });

      if (error) {
        setErrorMessage(error.message);
        setShowError(true);
        console.error("Google sign-up error:", error);
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
    <div className="space-y-4">
      <Button 
        type="button" 
        variant="outline" 
        className="w-full py-6 flex items-center justify-center gap-2"
        onClick={handleGoogleSignUp}
      >
        <FcGoogle className="w-5 h-5" />
        <span>Continue with Google</span>
      </Button>
      
      <div className="relative my-6">
        <Separator />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1A1F2C] px-2 text-xs text-gray-400">
          OR
        </span>
      </div>
    
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-name">Full Name</Label>
          <Input 
            id="signup-name"
            type="text"
            placeholder="Your Name"
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
        
        <div className="space-y-2">
          <Label htmlFor="signup-school">School Name</Label>
          <Input 
            id="signup-school"
            type="text"
            placeholder="Enter school name"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-country">Country</Label>
          <Input 
            id="signup-country"
            type="text"
            placeholder="Enter country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
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
