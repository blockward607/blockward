
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users } from "lucide-react";

interface PendingUsersManagementProps {
  schoolId?: string | null;
}

export const PendingUsersManagement = ({ schoolId }: PendingUsersManagementProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-400">All users can sign up and access features immediately</p>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Automatic Access Enabled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-white mb-2">No Approval Required</h3>
            <p className="text-sm">
              Users can sign up as teachers, students, or admins and immediately access all features.
            </p>
            <p className="text-sm mt-2">
              No pending requests or admin approval needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
