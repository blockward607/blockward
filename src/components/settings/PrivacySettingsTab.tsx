
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Eye, Shield, BarChart } from "lucide-react";

interface PrivacySettingsTabProps {
  settings: {
    profile_visibility: string;
    data_sharing: boolean;
    analytics_opt_in: boolean;
  };
  onUpdate: (settings: any) => void;
}

export const PrivacySettingsTab = ({ settings, onUpdate }: PrivacySettingsTabProps) => {
  const handleSettingChange = (key: string, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
        <CardDescription className="text-gray-400">
          Control your privacy and data sharing preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-400" />
            <Label className="text-white font-medium">Profile Visibility</Label>
          </div>
          <Select
            value={settings.profile_visibility}
            onValueChange={(value) => handleSettingChange('profile_visibility', value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="school">School Only</SelectItem>
              <SelectItem value="teachers">Teachers Only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-400">Who can see your profile information</p>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div className="space-y-1">
            <Label className="text-white font-medium">Data Sharing</Label>
            <p className="text-sm text-gray-400">Allow sharing of anonymized data for research</p>
          </div>
          <Switch
            checked={settings.data_sharing}
            onCheckedChange={(checked) => handleSettingChange('data_sharing', checked)}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4 text-green-400" />
              <Label className="text-white font-medium">Analytics Opt-in</Label>
            </div>
            <p className="text-sm text-gray-400">Help improve the platform with usage analytics</p>
          </div>
          <Switch
            checked={settings.analytics_opt_in}
            onCheckedChange={(checked) => handleSettingChange('analytics_opt_in', checked)}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>

        <Button 
          onClick={() => onUpdate(settings)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold transition-colors"
        >
          Save Privacy Settings
        </Button>
      </CardContent>
    </Card>
  );
};
