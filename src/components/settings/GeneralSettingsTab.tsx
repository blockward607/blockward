
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Zap, Mail, Users, Clock, Save } from "lucide-react";

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
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border-slate-700/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-600/80 to-blue-600/80 rounded-lg">
              <Settings className="h-5 w-5 text-white" />
            </div>
            General Settings
          </CardTitle>
          <CardDescription className="text-gray-400 text-base">
            Configure your basic preferences and classroom defaults
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Auto-grading Setting */}
          <div className="group p-6 bg-gradient-to-r from-slate-800/30 to-slate-800/10 rounded-xl border border-slate-700/30 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <Label className="text-white font-semibold text-lg">Auto-grading</Label>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Automatically grade multiple choice assignments when submitted by students
                </p>
              </div>
              <div className="ml-6">
                <Switch
                  checked={autoGrading}
                  onCheckedChange={(checked) => {
                    console.log('Auto-grading changed to:', checked);
                    setAutoGrading(checked);
                  }}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-blue-600 scale-110"
                />
              </div>
            </div>
          </div>

          {/* Email Notifications Setting */}
          <div className="group p-6 bg-gradient-to-r from-slate-800/30 to-slate-800/10 rounded-xl border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <Label className="text-white font-semibold text-lg">Email Notifications</Label>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Receive email updates about student activity and submissions
                </p>
              </div>
              <div className="ml-6">
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={(checked) => {
                    console.log('Email notifications changed to:', checked);
                    setEmailNotifications(checked);
                  }}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-purple-600 scale-110"
                />
              </div>
            </div>
          </div>

          {/* Class Size Setting */}
          <div className="group p-6 bg-gradient-to-r from-slate-800/30 to-slate-800/10 rounded-xl border border-slate-700/30 hover:border-green-500/30 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-400" />
                <Label className="text-white font-semibold text-lg">
                  Maximum Class Size: {classSize[0]} students
                </Label>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Set the maximum number of students allowed in your classes
              </p>
              <div className="pt-2">
                <Slider
                  value={classSize}
                  onValueChange={(value) => {
                    console.log('Class size changed to:', value);
                    setClassSize(value);
                  }}
                  max={50}
                  min={10}
                  step={5}
                  className="w-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-green-500 [&_[role=slider]]:to-emerald-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>10</span>
                  <span>50</span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Timeout Setting */}
          <div className="group p-6 bg-gradient-to-r from-slate-800/30 to-slate-800/10 rounded-xl border border-slate-700/30 hover:border-yellow-500/30 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-400" />
                <Label className="text-white font-semibold text-lg">
                  Session Timeout: {sessionTimeout[0]} minutes
                </Label>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                How long before inactive users are automatically logged out
              </p>
              <div className="pt-2">
                <Slider
                  value={sessionTimeout}
                  onValueChange={(value) => {
                    console.log('Session timeout changed to:', value);
                    setSessionTimeout(value);
                  }}
                  max={180}
                  min={15}
                  step={15}
                  className="w-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-yellow-500 [&_[role=slider]]:to-orange-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>15 min</span>
                  <span>3 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
              <Button 
                onClick={() => {
                  console.log('Saving general settings...');
                  onSave();
                }}
                className="relative w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                <Save className="h-5 w-5 mr-2" />
                Save General Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
