
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface SecuritySettingsTabProps {
  twoFactorAuth: boolean;
  setTwoFactorAuth: (value: boolean) => void;
  passwordExpiry: number[];
  setPasswordExpiry: (value: number[]) => void;
  loginAttempts: number[];
  setLoginAttempts: (value: number[]) => void;
  onSave: () => void;
}

export const SecuritySettingsTab = ({
  twoFactorAuth,
  setTwoFactorAuth,
  passwordExpiry,
  setPasswordExpiry,
  loginAttempts,
  setLoginAttempts,
  onSave
}: SecuritySettingsTabProps) => {
  console.log('SecuritySettingsTab rendered with:', { twoFactorAuth, passwordExpiry, loginAttempts });

  return (
    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-500" />
          Security Settings
        </CardTitle>
        <CardDescription className="text-gray-400">
          Manage your account security preferences and authentication settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Label className="text-white font-medium">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-400">
                Add an extra layer of security to your account with 2FA
              </p>
            </div>
            <Switch
              checked={twoFactorAuth}
              onCheckedChange={(checked) => {
                console.log('Two-factor auth changed to:', checked);
                setTwoFactorAuth(checked);
              }}
              className="data-[state=checked]:bg-purple-600 ml-4"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
          <div>
            <Label className="text-white font-medium">Password Expiry: {passwordExpiry[0]} days</Label>
            <p className="text-sm text-gray-400 mb-3">
              How often users should be required to change their passwords
            </p>
            <Slider
              value={passwordExpiry}
              onValueChange={(value) => {
                console.log('Password expiry changed to:', value);
                setPasswordExpiry(value);
              }}
              max={365}
              min={30}
              step={30}
              className="w-full"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
          <div>
            <Label className="text-white font-medium">Max Login Attempts: {loginAttempts[0]}</Label>
            <p className="text-sm text-gray-400 mb-3">
              Maximum number of failed login attempts before account lockout
            </p>
            <Slider
              value={loginAttempts}
              onValueChange={(value) => {
                console.log('Login attempts changed to:', value);
                setLoginAttempts(value);
              }}
              max={10}
              min={3}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="p-4 bg-orange-900/20 border border-orange-700/50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            </div>
            <div>
              <h4 className="text-orange-200 font-medium mb-1">Security Notice</h4>
              <p className="text-orange-300 text-sm">
                These security settings help protect your account. Enable two-factor authentication for the best protection.
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => {
            console.log('Saving security settings...');
            onSave();
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold transition-colors"
        >
          Save Security Settings
        </Button>
      </CardContent>
    </Card>
  );
};
