
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
    confirmPassword: "",
    institutionCode: ""
  });
  const [institutionValid, setInstitutionValid] = useState(true); // Default to true since it's optional
  const [validatedSchoolName, setValidatedSchoolName] = useState("");
  const [loading, setLoading] = useState(false);

  // Update formData when props change
  useState(() => {
    setFormData(prev => ({
      ...prev,
      email: props.email,
      password: props.password
    }));
  });

  const handleValidation = (isValid: boolean, message?: string) => {
    setInstitutionValid(isValid);
    if (isValid && message) {
      setValidatedSchoolName(message);
    }
    
    if (!isValid && message) {
      props.setErrorMessage(message);
      props.setShowError(true);
    } else {
      props.setShowError(false);
    }
  };

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

    // Institution code validation only if provided
    if ((props.role === 'teacher' || props.role === 'student') && formData.institutionCode.trim() && !institutionValid) {
      props.setErrorMessage("Please enter a valid institution code or leave it empty");
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
      if (props.role === 'admin') {
        // For admin, use regular Supabase auth signup
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin-dashboard`,
            data: {
              full_name: formData.fullName,
              role: 'admin'
            }
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link to complete your registration."
          });
        } else {
          toast({
            title: "Account created",
            description: "Your admin account has been created successfully."
          });
          navigate('/admin-dashboard');
        }
      } else {
        // For teacher/student, use the pending users system
        const { data, error } = await supabase.rpc('create_pending_user', {
          p_email: formData.email,
          p_full_name: formData.fullName,
          p_role: props.role,
          p_institution_code: formData.institutionCode.trim() || null, // Pass null if empty
          p_additional_info: {
            password: formData.password,
            school_name: validatedSchoolName || 'No specific school'
          }
        });

        if (error) throw error;

        const result = data as { valid: boolean; message?: string; error?: string };
        
        if (result.valid) {
          toast({
            title: "Registration Submitted",
            description: result.message || "Your registration has been submitted. You can now sign in!"
          });
          
          // Clear form
          setFormData({
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            institutionCode: ""
          });
          props.setEmail("");
          props.setPassword("");
        } else {
          throw new Error(result.error || 'Registration failed');
        }
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
        showInstitutionCode={props.role === 'teacher' || props.role === 'student'}
        onInstitutionValidation={handleValidation}
      />
      
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        disabled={loading}
      >
        {loading ? "Creating Account..." : `Sign Up as ${props.role.charAt(0).toUpperCase() + props.role.slice(1)}`}
      </Button>
    </form>
  );
};
