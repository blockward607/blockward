
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Mail, Smartphone } from "lucide-react";

interface NotificationsSettingsTabProps {
  settings: {
    email_enabled: boolean;
    push_enabled: boolean;
    digest_frequency: string;
  };
  onUpdate: (settings: any) => void;
}

export const NotificationsSettingsTab = ({ settings, onUpdate }: NotificationsSettingsTabProps) => {
  const handleSettingChange = (key: string, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription className="text-gray-400">
          Manage how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-400" />
              <Label className="text-white font-medium">Email Notifications</Label>
            </div>
            <p className="text-sm text-gray-400">Receive notifications via email</p>
          </div>
          <Switch
            checked={settings.email_enabled}
            onCheckedChange={(checked) => handleSettingChange('email_enabled', checked)}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-green-400" />
              <Label className="text-white font-medium">Push Notifications</Label>
            </div>
            <p className="text-sm text-gray-400">Receive instant push notifications</p>
          </div>
          <Switch
            checked={settings.push_enabled}
            onCheckedChange={(checked) => handleSettingChange('push_enabled', checked)}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-white font-medium">Digest Frequency</Label>
          <Select
            value={settings.digest_frequency}
            onValueChange={(value) => handleSettingChange('digest_frequency', value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-400">How often you want to receive notification summaries</p>
        </div>

        <Button 
          onClick={() => onUpdate(settings)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold transition-colors"
        >
          Save Notification Settings
        </Button>
      </CardContent>
    </Card>
  );
};
