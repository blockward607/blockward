
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminPermissions {
  manage_teachers: boolean;
  manage_students: boolean;
  manage_classes: boolean;
  manage_settings: boolean;
}

interface AdminSettingsTabProps {
  adminName: string;
  setAdminName: (value: string) => void;
  adminPosition: string;
  setAdminPosition: (value: string) => void;
  adminPermissions: AdminPermissions;
  setAdminPermissions: (value: AdminPermissions) => void;
  onSave: () => void;
}

export const AdminSettingsTab = ({
  adminName,
  setAdminName,
  adminPosition,
  setAdminPosition,
  adminPermissions,
  setAdminPermissions,
  onSave
}: AdminSettingsTabProps) => {
  const handlePermissionChange = (permission: keyof AdminPermissions, checked: boolean) => {
    const newPermissions = {
      ...adminPermissions,
      [permission]: checked
    };
    setAdminPermissions(newPermissions);
  };

  return (
    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Admin Profile Settings</CardTitle>
        <CardDescription className="text-gray-400">
          Manage your administrative profile and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-white">Full Name</Label>
          <Input
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500"
            placeholder="Enter your full name"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Position</Label>
          <Input
            value={adminPosition}
            onChange={(e) => setAdminPosition(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500"
            placeholder="e.g., Principal, Head Teacher, IT Administrator"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-white text-lg font-semibold">Administrative Permissions</Label>
          
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="space-y-1">
                <Label className="text-white font-medium">Manage Teachers</Label>
                <p className="text-sm text-gray-400">Add, edit, and remove teacher accounts</p>
              </div>
              <Switch
                checked={adminPermissions.manage_teachers}
                onCheckedChange={(checked) => handlePermissionChange('manage_teachers', checked)}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="space-y-1">
                <Label className="text-white font-medium">Manage Students</Label>
                <p className="text-sm text-gray-400">Add, edit, and remove student accounts</p>
              </div>
              <Switch
                checked={adminPermissions.manage_students}
                onCheckedChange={(checked) => handlePermissionChange('manage_students', checked)}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="space-y-1">
                <Label className="text-white font-medium">Manage Classes</Label>
                <p className="text-sm text-gray-400">Create and manage classroom configurations</p>
              </div>
              <Switch
                checked={adminPermissions.manage_classes}
                onCheckedChange={(checked) => handlePermissionChange('manage_classes', checked)}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="space-y-1">
                <Label className="text-white font-medium">Manage Settings</Label>
                <p className="text-sm text-gray-400">Access and modify school-wide settings</p>
              </div>
              <Switch
                checked={adminPermissions.manage_settings}
                onCheckedChange={(checked) => handlePermissionChange('manage_settings', checked)}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={onSave}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold transition-colors"
        >
          Save Admin Settings
        </Button>
      </CardContent>
    </Card>
  );
};
