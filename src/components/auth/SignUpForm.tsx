
import { useState } from "react";
import { SignUpFormFields } from "./SignUpFormFields";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SignUpFormProps {
  role: 'teacher' | 'student' | 'admin';
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  loading?: boolean;
}

export const SignUpForm = (props: SignUpFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: props.email,
    password: props.password,
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      props.setErrorMessage("Full name is required");
      props.setShowError(true);
      return false;
    }

    if (!formData.email.trim()) {
      props.setErrorMessage("Email is required");
      props.setShowError(true);
      return false;
    }

    if (!formData.password) {
      props.setErrorMessage("Password is required");
      props.setShowError(true);
      return false;
    }

    if (formData.password.length < 6) {
      props.setErrorMessage("Password must be at least 6 characters");
      props.setShowError(true);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      props.setErrorMessage("Passwords do not match");
      props.setShowError(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    props.setLoading(true);
    props.setShowError(false);

    try {
      // Direct signup with Supabase Auth - immediate access
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: props.role
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Welcome to BlockWard!",
          description: "Your account has been created successfully. You can now sign in and start using all features immediately."
        });
        
        // Clear form
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: ""
        });
        props.setEmail("");
        props.setPassword("");
        
        // Navigate to sign in
        navigate('/auth');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      props.setErrorMessage(error.message || 'Failed to create account. Please try again.');
      props.setShowError(true);
    } finally {
      setLoading(false);
      props.setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SignUpFormFields
        formData={formData}
        setFormData={setFormData}
        showInstitutionCode={false}
      />
      
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        disabled={loading}
      >
        {loading ? "Creating Account..." : `Create ${props.role.charAt(0).toUpperCase() + props.role.slice(1)} Account`}
      </Button>
    </form>
  );
};
