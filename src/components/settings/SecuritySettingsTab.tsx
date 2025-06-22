
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Clock, AlertTriangle } from "lucide-react";

interface SecuritySettingsTabProps {
  settings: {
    session_timeout: number;
    max_login_attempts: number;
    require_2fa: boolean;
  };
  onUpdate: (settings: any) => void;
}

export const SecuritySettingsTab = ({ settings, onUpdate }: SecuritySettingsTabProps) => {
  const handleSettingChange = (key: string, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Settings
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure security and authentication preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-yellow-400" />
              <Label className="text-white font-medium">Two-Factor Authentication</Label>
            </div>
            <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
          </div>
          <Switch
            checked={settings.require_2fa}
            onCheckedChange={(checked) => handleSettingChange('require_2fa', checked)}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <Label className="text-white font-medium">Session Timeout (minutes)</Label>
          </div>
          <Input
            type="number"
            value={settings.session_timeout}
            onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
            className="bg-gray-800 border-gray-600 text-white focus:border-purple-500"
            min="5"
            max="480"
          />
          <p className="text-sm text-gray-400">How long before you're automatically logged out</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <Label className="text-white font-medium">Max Login Attempts</Label>
          </div>
          <Input
            type="number"
            value={settings.max_login_attempts}
            onChange={(e) => handleSettingChange('max_login_attempts', parseInt(e.target.value))}
            className="bg-gray-800 border-gray-600 text-white focus:border-purple-500"
            min="3"
            max="10"
          />
          <p className="text-sm text-gray-400">Number of failed attempts before account lockout</p>
        </div>

        <Button 
          onClick={() => onUpdate(settings)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold transition-colors"
        >
          Save Security Settings
        </Button>
      </CardContent>
    </Card>
  );
};
