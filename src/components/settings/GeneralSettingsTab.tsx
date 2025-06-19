
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

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
  console.log('GeneralSettingsTab rendered with:', { autoGrading, emailNotifications, classSize, sessionTimeout });

  return (
    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-500" />
          General Settings
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure your basic preferences and classroom defaults
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Label className="text-white font-medium">Auto-grading</Label>
              <p className="text-sm text-gray-400">
                Automatically grade multiple choice assignments when submitted
              </p>
            </div>
            <Switch
              checked={autoGrading}
              onCheckedChange={(checked) => {
                console.log('Auto-grading changed to:', checked);
                setAutoGrading(checked);
              }}
              className="data-[state=checked]:bg-purple-600 ml-4"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Label className="text-white font-medium">Email Notifications</Label>
              <p className="text-sm text-gray-400">
                Receive email updates about student activity and submissions
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={(checked) => {
                console.log('Email notifications changed to:', checked);
                setEmailNotifications(checked);
              }}
              className="data-[state=checked]:bg-purple-600 ml-4"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
          <div>
            <Label className="text-white font-medium">Maximum Class Size: {classSize[0]} students</Label>
            <p className="text-sm text-gray-400 mb-3">
              Set the maximum number of students allowed in your classes
            </p>
            <Slider
              value={classSize}
              onValueChange={(value) => {
                console.log('Class size changed to:', value);
                setClassSize(value);
              }}
              max={50}
              min={10}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
          <div>
            <Label className="text-white font-medium">Session Timeout: {sessionTimeout[0]} minutes</Label>
            <p className="text-sm text-gray-400 mb-3">
              How long before inactive users are automatically logged out
            </p>
            <Slider
              value={sessionTimeout}
              onValueChange={(value) => {
                console.log('Session timeout changed to:', value);
                setSessionTimeout(value);
              }}
              max={180}
              min={15}
              step={15}
              className="w-full"
            />
          </div>
        </div>

        <Button 
          onClick={() => {
            console.log('Saving general settings...');
            onSave();
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold transition-colors"
        >
          Save General Settings
        </Button>
      </CardContent>
    </Card>
  );
};
