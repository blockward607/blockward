
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GeneralSettingsTabProps {
  autoGrading: boolean;
  setAutoGrading: (value: boolean) => void;
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  classSize: number[];
  setClassSize: (value: number[]) => void;
  sessionTimeout: number[];
  setSessionTimeout: (value: number[]) => void;
  onSave: () => void;
}

export const GeneralSettingsTab = ({
  autoGrading,
  setAutoGrading,
  emailNotifications,
  setEmailNotifications,
  classSize,
  setClassSize,
  sessionTimeout,
  setSessionTimeout,
  onSave
}: GeneralSettingsTabProps) => {
  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">General Settings</CardTitle>
        <CardDescription>Configure your basic preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-white">Auto-grading</Label>
            <p className="text-sm text-gray-400">Automatically grade multiple choice assignments</p>
          </div>
          <Switch
            checked={autoGrading}
            onCheckedChange={setAutoGrading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-white">Email Notifications</Label>
            <p className="text-sm text-gray-400">Receive email updates about activity</p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-white">Maximum Class Size: {classSize[0]} students</Label>
          <Slider
            value={classSize}
            onValueChange={setClassSize}
            max={50}
            min={10}
            step={5}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-white">Session Timeout: {sessionTimeout[0]} minutes</Label>
          <Slider
            value={sessionTimeout}
            onValueChange={setSessionTimeout}
            max={180}
            min={15}
            step={15}
            className="w-full"
          />
        </div>

        <Button 
          onClick={onSave}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Save General Settings
        </Button>
      </CardContent>
    </Card>
  );
};
