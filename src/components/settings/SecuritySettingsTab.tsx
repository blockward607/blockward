
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Security Settings</CardTitle>
        <CardDescription>Manage your account security preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-white">Two-Factor Authentication</Label>
            <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
          </div>
          <Switch
            checked={twoFactorAuth}
            onCheckedChange={setTwoFactorAuth}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-white">Password Expiry: {passwordExpiry[0]} days</Label>
          <Slider
            value={passwordExpiry}
            onValueChange={setPasswordExpiry}
            max={365}
            min={30}
            step={30}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-white">Max Login Attempts: {loginAttempts[0]}</Label>
          <Slider
            value={loginAttempts}
            onValueChange={setLoginAttempts}
            max={10}
            min={3}
            step={1}
            className="w-full"
          />
        </div>

        <Button 
          onClick={onSave}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Save Security Settings
        </Button>
      </CardContent>
    </Card>
  );
};
