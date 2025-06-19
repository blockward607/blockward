
import { Settings } from "lucide-react";

interface SettingsHeaderProps {
  userRole: string | null;
}

export const SettingsHeader = ({ userRole }: SettingsHeaderProps) => {
  const isAdmin = userRole === 'admin';
  const isTeacher = userRole === 'teacher';

  return (
    <div className="flex items-center gap-3 mb-6">
      <Settings className="h-8 w-8 text-purple-500" />
      <div>
        <h1 className="text-3xl font-bold text-white">
          {isAdmin ? 'Admin Settings' : isTeacher ? 'Teacher Settings' : 'Settings'}
        </h1>
        <p className="text-gray-400">
          {isAdmin ? 'Manage school and administrative preferences' : 'Manage your classroom and preferences'}
        </p>
      </div>
    </div>
  );
};
