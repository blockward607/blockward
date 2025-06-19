
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Shield, Palette, Users, Building } from "lucide-react";

interface SettingsTabsListProps {
  isAdmin: boolean;
}

export const SettingsTabsList = ({ isAdmin }: SettingsTabsListProps) => {
  return (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="general">
        <Settings className="h-4 w-4 mr-2" />
        General
      </TabsTrigger>
      <TabsTrigger value="security">
        <Shield className="h-4 w-4 mr-2" />
        Security
      </TabsTrigger>
      <TabsTrigger value="appearance">
        <Palette className="h-4 w-4 mr-2" />
        Appearance
      </TabsTrigger>
      <TabsTrigger value="students">
        <Users className="h-4 w-4 mr-2" />
        Students
      </TabsTrigger>
      {isAdmin && (
        <TabsTrigger value="admin">
          <Building className="h-4 w-4 mr-2" />
          Admin
        </TabsTrigger>
      )}
    </TabsList>
  );
};
