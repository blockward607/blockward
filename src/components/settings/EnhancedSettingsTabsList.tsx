
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
    <TabsList className={`grid w-full grid-cols-${Math.min(tabs.length, 7)}`}>
      {tabs.map(({ id, label, icon: Icon }) => (
        <TabsTrigger key={id} value={id} className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
