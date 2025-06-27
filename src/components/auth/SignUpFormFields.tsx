
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignUpFormFieldsProps {
  formData: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>>;
  showInstitutionCode: boolean;
}

export const SignUpFormFields = ({ 
  formData, 
  setFormData, 
  showInstitutionCode 
}: SignUpFormFieldsProps) => {
  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          placeholder="Enter your full name"
          className="bg-gray-700 border-gray-600 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Enter your email"
          className="bg-gray-700 border-gray-600 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          placeholder="Enter your password"
          className="bg-gray-700 border-gray-600 text-white"
          required
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          placeholder="Confirm your password"
          className="bg-gray-700 border-gray-600 text-white"
          required
        />
      </div>
    </div>
  );
};
