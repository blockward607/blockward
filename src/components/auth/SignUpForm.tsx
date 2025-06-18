
import { SignUpFormFields } from "./SignUpFormFields";

interface SignUpFormProps {
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
      <SignUpFormFields {...props} />
    </div>
  );
};
