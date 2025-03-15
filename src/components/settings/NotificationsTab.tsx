
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";

const NotificationsTab = () => {
  const {
    emailNotifications,
    setEmailNotifications,
    achievementAlerts,
    setAchievementAlerts,
    handleSaveNotificationSettings
  } = useNotificationSettings();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-gray-400">Receive email updates about your activity</p>
          </div>
          <Switch 
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Achievement Alerts</Label>
            <p className="text-sm text-gray-400">Get notified when students earn achievements</p>
          </div>
          <Switch 
            checked={achievementAlerts}
            onCheckedChange={setAchievementAlerts}
          />
        </div>
        <Button 
          className="w-full md:w-auto mt-4"
          onClick={handleSaveNotificationSettings}
        >
          Save Notification Settings
        </Button>
      </div>
    </div>
  );
};

export default NotificationsTab;
