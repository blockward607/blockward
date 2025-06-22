
import { Settings, Sparkles } from "lucide-react";

interface SettingsHeaderProps {
  userRole: string | null;
}

export const SettingsHeader = ({ userRole }: SettingsHeaderProps) => {
  const isAdmin = userRole === 'admin';
  const isTeacher = userRole === 'teacher';

  return (
    <div className="relative mb-8">
      {/* Background glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-50"></div>
      
      <div className="relative flex items-center gap-4">
        <div className="relative">
          <div className="p-3 bg-gradient-to-br from-purple-600/80 to-blue-600/80 rounded-xl shadow-lg">
            <Settings className="h-8 w-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            {isAdmin ? 'Admin Settings' : isTeacher ? 'Teacher Settings' : 'Settings'}
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            {isAdmin 
              ? 'Manage school and administrative preferences with advanced controls' 
              : isTeacher 
              ? 'Customize your classroom experience and teaching preferences'
              : 'Personalize your learning experience and account preferences'
            }
          </p>
          
          {/* Role badge */}
          <div className="mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              isAdmin 
                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                : isTeacher 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-green-500/20 text-green-300 border border-green-500/30'
            }`}>
              {isAdmin ? '👑 Administrator' : isTeacher ? '🎓 Teacher' : '📚 Student'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
