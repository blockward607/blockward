
import { useState } from "react";
import { SignUpFormFields } from "./SignUpFormFields";

interface SignUpFormProps {
  role: 'teacher' | 'student' | 'admin';
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const SignUpForm = (props: SignUpFormProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: props.email,
    password: props.password,
    confirmPassword: "",
    institutionCode: ""
  });

  // Update formData when props change
  useState(() => {
    setFormData(prev => ({
      ...prev,
      email: props.email,
      password: props.password
    }));
  });

  const handleValidation = (isValid: boolean, message?: string) => {
    if (!isValid && message) {
      props.setErrorMessage(message);
      props.setShowError(true);
    } else {
      props.setShowError(false);
    }
  };

  return (
    <div className="space-y-4">
      <SignUpFormFields
        formData={formData}
        setFormData={setFormData}
        showInstitutionCode={props.role === 'teacher' || props.role === 'student'}
        onInstitutionValidation={handleValidation}
      />
    </div>
  );
};
