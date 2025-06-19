
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Building } from "lucide-react";

interface SettingsTabsListProps {
  isAdmin: boolean;
}

export const SettingsTabsList = ({ isAdmin }: SettingsTabsListProps) => {
  return (
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="general">
        <Settings className="h-4 w-4 mr-2" />
        General
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
