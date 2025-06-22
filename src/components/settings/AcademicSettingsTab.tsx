
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, Calendar } from "lucide-react";

interface AcademicSettingsTabProps {
  settings: {
    grading_scale: string;
    attendance_tracking: boolean;
    auto_grade_assignments: boolean;
  };
  onUpdate: (settings: any) => void;
}

export const AcademicSettingsTab = ({ settings, onUpdate }: AcademicSettingsTabProps) => {
  const handleSettingChange = (key: string, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Academic Settings
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure academic and grading preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-400" />
            <Label className="text-white font-medium">Grading Scale</Label>
          </div>
          <Select
            value={settings.grading_scale}
            onValueChange={(value) => handleSettingChange('grading_scale', value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A-F">A-F Scale</SelectItem>
              <SelectItem value="1-10">1-10 Scale</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="pass-fail">Pass/Fail</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-400">Choose your preferred grading system</p>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <Label className="text-white font-medium">Attendance Tracking</Label>
            </div>
            <p className="text-sm text-gray-400">Enable automatic attendance tracking</p>
          </div>
          <Switch
            checked={settings.attendance_tracking}
            onCheckedChange={(checked) => handleSettingChange('attendance_tracking', checked)}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-400" />
              <Label className="text-white font-medium">Auto-Grade Assignments</Label>
            </div>
            <p className="text-sm text-gray-400">Automatically grade certain assignment types</p>
          </div>
          <Switch
            checked={settings.auto_grade_assignments}
            onCheckedChange={(checked) => handleSettingChange('auto_grade_assignments', checked)}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>

        <Button 
          onClick={() => onUpdate(settings)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold transition-colors"
        >
          Save Academic Settings
        </Button>
      </CardContent>
    </Card>
  );
};
