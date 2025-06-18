
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import { AdminSignInForm } from "./AdminSignInForm";
import { AdminSignUpForm } from "./AdminSignUpForm";
import { AdminAuthError } from "./AdminAuthError";

interface AdminAuthFormProps {
  showError: boolean;
  errorMessage: string;
  onResetError: () => void;
}

export const AdminAuthForm = ({ showError, errorMessage, onResetError }: AdminAuthFormProps) => {
  const [activeTab, setActiveTab] = useState("signin");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onResetError();
  };

  return (
    <Card className="glass-card p-8 border-red-500/30 bg-gray-900/80">
      <div className="flex justify-center mb-6">
        <Shield className="h-12 w-12 text-red-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-2 text-white">Administrator Portal</h2>
      <p className="text-center text-red-300 mb-6">Secure admin access only</p>
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-red-900/50">
          <TabsTrigger value="signin" className="data-[state=active]:bg-red-600 text-red-200">
            Sign In
          </TabsTrigger>
          <TabsTrigger value="signup" className="data-[state=active]:bg-red-600 text-red-200">
            Sign Up
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <AdminSignInForm />
        </TabsContent>
        
        <TabsContent value="signup">
          <AdminSignUpForm />
        </TabsContent>
      </Tabs>

      <AdminAuthError showError={showError} errorMessage={errorMessage} />
    </Card>
  );
};
