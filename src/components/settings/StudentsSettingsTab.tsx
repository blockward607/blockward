
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Student Management</CardTitle>
        <CardDescription>Control how students interact with your classes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-white">Allow Student Self-Registration</Label>
            <p className="text-sm text-gray-400">Let students join classes using invitation codes</p>
          </div>
          <Switch
            checked={studentRegistration}
            onCheckedChange={setStudentRegistration}
          />
        </div>

        <Button 
          onClick={onSave}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Save Student Settings
        </Button>
      </CardContent>
    </Card>
  );
};
