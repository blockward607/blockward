
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
  return (
    <div className="space-y-4">
      {props.role === 'admin' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm text-center">
            Admin accounts must be created through the admin setup process. 
            Please contact your system administrator.
          </p>
        </div>
      )}
      {props.role !== 'admin' && <SignUpFormFields {...props} />}
    </div>
  );
};
