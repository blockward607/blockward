
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface StudentsSettingsTabProps {
  studentRegistration: boolean;
  setStudentRegistration: (value: boolean) => void;
  onSave: () => void;
}

export const StudentsSettingsTab = ({
  studentRegistration,
  setStudentRegistration,
  onSave
}: StudentsSettingsTabProps) => {
  return (
    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-500" />
          Student Management
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure how students interact with your classes and registration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Label className="text-white font-medium">Allow Student Self-Registration</Label>
              <p className="text-sm text-gray-400">
                When enabled, students can join classes using invitation codes without teacher approval
              </p>
            </div>
            <Switch
              checked={studentRegistration}
              onCheckedChange={setStudentRegistration}
              className="data-[state=checked]:bg-purple-600 ml-4"
            />
          </div>
        </div>

        <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
            <div>
              <h4 className="text-blue-200 font-medium mb-1">Registration Info</h4>
              <p className="text-blue-300 text-sm">
                {studentRegistration 
                  ? "Students can join classes automatically using invitation codes you provide." 
                  : "Students will need manual approval to join classes, giving you full control over enrollment."
                }
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={onSave}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold transition-colors"
        >
          Save Student Settings
        </Button>
      </CardContent>
    </Card>
  );
};
