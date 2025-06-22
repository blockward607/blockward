
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface SignUpFormFieldsProps {
  formData: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    institutionCode: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    institutionCode: string;
  }>>;
  showInstitutionCode: boolean;
  onInstitutionValidation?: (isValid: boolean, message?: string) => void;
}

interface ValidationResult {
  valid: boolean;
  school_name?: string;
  error?: string;
}

export const SignUpFormFields = ({ 
  formData, 
  setFormData, 
  showInstitutionCode, 
  onInstitutionValidation 
}: SignUpFormFieldsProps) => {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateInstitutionCode = async (code: string) => {
    if (code.length < 6) return;
    
    setValidating(true);
    try {
      const { data, error } = await supabase.rpc('validate_institution_code', {
        code: code
      });

      if (error) throw error;

      const result = data as { valid: boolean; school_name?: string; error?: string };
      
      setValidationResult(result);
      
      if (result.valid) {
        onInstitutionValidation?.(true, result.school_name || '');
      } else {
        onInstitutionValidation?.(false, result.error || 'Invalid code');
      }
    } catch (error: any) {
      console.error('Institution code validation error:', error);
      const errorResult = { valid: false, error: 'Validation failed' };
      setValidationResult(errorResult);
      onInstitutionValidation?.(false, errorResult.error);
    } finally {
      setValidating(false);
    }
  };

  // Auto-validate institution code when it changes
  useEffect(() => {
    if (showInstitutionCode && formData.institutionCode && formData.institutionCode.length >= 6) {
      validateInstitutionCode(formData.institutionCode);
    } else if (showInstitutionCode && formData.institutionCode.length < 6) {
      setValidationResult(null);
      // Institution code is now optional, so we consider empty as valid
      onInstitutionValidation?.(true);
    } else if (showInstitutionCode) {
      // Empty institution code is valid now
      onInstitutionValidation?.(true);
    }
  }, [formData.institutionCode, showInstitutionCode]);

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

      {showInstitutionCode && (
        <div className="space-y-2">
          <Label htmlFor="institutionCode" className="text-gray-300">
            Institution Code <span className="text-sm text-gray-400">(Optional)</span>
          </Label>
          <div className="relative">
            <Input
              id="institutionCode"
              type="text"
              value={formData.institutionCode}
              onChange={(e) => handleInputChange('institutionCode', e.target.value.toUpperCase())}
              placeholder="Enter your school's institution code (optional)"
              className="bg-gray-700 border-gray-600 text-white uppercase"
              maxLength={6}
            />
            {validating && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
              </div>
            )}
          </div>
          
          {validationResult && formData.institutionCode && (
            <div className={`text-sm ${validationResult.valid ? 'text-green-400' : 'text-red-400'}`}>
              {validationResult.valid 
                ? `✓ Valid - ${validationResult.school_name || 'Institution found'}`
                : validationResult.error || 'Invalid institution code'
              }
            </div>
          )}
          
          <div className="text-xs text-gray-400">
            Leave empty to join without a specific school, or contact your school administrator to get the 6-character institution code
          </div>
        </div>
      )}

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
