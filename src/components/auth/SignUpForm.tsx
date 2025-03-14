
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { GoogleSignUpButton } from "./GoogleSignUpButton";
import { SignUpFormFields } from "./SignUpFormFields";

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

export const SignUpForm = (props: SignUpFormProps) => {
  return (
    <div className="space-y-4">
      <GoogleSignUpButton 
        role={props.role}
        setErrorMessage={props.setErrorMessage}
        setShowError={props.setShowError}
        setLoading={props.setLoading}
      />
      
      <div className="relative my-6">
        <Separator />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1A1F2C] px-2 text-xs text-gray-400">
          OR
        </span>
      </div>
    
      <SignUpFormFields {...props} />
    </div>
  );
};
