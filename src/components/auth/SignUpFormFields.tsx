
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SignUpFormFieldsProps {
  role: 'teacher' | 'student';
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
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [country, setCountry] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setShowError(false);

    if (!name) {
      setErrorMessage("Please enter your name");
      setShowError(true);
      setEmailLoading(false);
      return;
    }

    if (!schoolName) {
      setErrorMessage("Please enter your school name");
      setShowError(true);
      setEmailLoading(false);
      return;
    }

    try {
      console.log(`Signing up with email: ${email}, role: ${role}`);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            name: name,
            school: schoolName,
            country: country
          },
          emailRedirectTo: window.location.origin + '/dashboard'
        }
      });

      if (error) {
        setErrorMessage(error.message);
        setShowError(true);
        console.error("Signup error:", error);
      } else if (data) {
        toast({
          title: `${role === 'teacher' ? 'Teacher' : 'Student'} account created`,
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowError(true);
    } finally {
      setEmailLoading(false);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name" className="text-white">Full Name</Label>
        <Input 
          id="signup-name"
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="glass-input text-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-white">Email</Label>
        <Input 
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="glass-input text-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-white">Password</Label>
        <Input 
          id="signup-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="glass-input text-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-school" className="text-white">School Name</Label>
        <Input 
          id="signup-school"
          type="text"
          placeholder="Enter school name"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          required
          className="glass-input text-white"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-country" className="text-white">Country</Label>
        <Input 
          id="signup-country"
          type="text"
          placeholder="Enter country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
          className="glass-input text-white"
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={emailLoading}>
        {emailLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating {role === 'teacher' ? 'Teacher' : 'Student'} Account...
          </>
        ) : (
          `Create ${role === 'teacher' ? 'Teacher' : 'Student'} Account`
        )}
      </Button>
    </form>
  );
};
