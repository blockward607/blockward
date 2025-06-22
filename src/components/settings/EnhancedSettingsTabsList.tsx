
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Building, 
  Shield, 
  Bell, 
  Palette, 
  User, 
  GraduationCap,
  Eye,
  BookOpen
} from "lucide-react";

interface EnhancedSettingsTabsListProps {
  userRole: string | null;
}

export const EnhancedSettingsTabsList = ({ userRole }: EnhancedSettingsTabsListProps) => {
  const adminTabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "admin", label: "Admin", icon: Building },
    { id: "institution", label: "Institution Codes", icon: GraduationCap }
  ];

  const teacherTabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "academic", label: "Academic", icon: BookOpen },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "profile", label: "Profile", icon: User }
  ];

  const studentTabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "profile", label: "Profile", icon: User }
  ];

  const tabs = userRole === 'admin' ? adminTabs : userRole === 'teacher' ? teacherTabs : studentTabs;

  return (
    <div className="relative">
      <TabsList className={`grid w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-1 shadow-lg grid-cols-${Math.min(tabs.length, 7)}`}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <TabsTrigger 
            key={id} 
            value={id} 
            className="relative flex items-center gap-2 px-4 py-3 rounded-lg text-gray-300 hover:text-white transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/80 data-[state=active]:to-blue-600/80 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-slate-700/50 group"
          >
            <div className="relative">
              <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/40 to-blue-600/40 rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </div>
            <span className="hidden sm:inline font-medium transition-all duration-300">{label}</span>
            
            {/* Active indicator line */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 group-data-[state=active]:w-3/4 transition-all duration-300 rounded-full"></div>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 rounded-xl blur-xl opacity-50 animate-pulse pointer-events-none"></div>
    </div>
  );
};
