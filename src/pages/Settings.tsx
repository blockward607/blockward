import { Settings as SettingsIcon, Bell, Shield, Palette, User, Award, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Import our custom components
import ProfileTab from "@/components/settings/ProfileTab";
// import NotificationsTab from "@/components/settings/NotificationsTab";
import { AppearanceTab } from "@/components/settings/AppearanceTab";
import SecurityTab from "@/components/settings/SecurityTab";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-purple-600/20">
          <SettingsIcon className="w-6 h-6 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card 
          className="p-6 hover:bg-purple-900/10 transition-all cursor-pointer"
          onClick={() => navigate('/rewards')}
        >
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-semibold">Rewards & NFTs</h3>
              <p className="text-sm text-gray-400">Manage student rewards and NFT awards</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 hover:bg-purple-900/10 transition-all cursor-pointer"
          onClick={() => navigate('/attendance')}
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="font-semibold">Attendance</h3>
              <p className="text-sm text-gray-400">Track and manage student attendance</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {/* <TabsTrigger value="notifications">Notifications</TabsTrigger> */}
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          {/* <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent> */}

          <TabsContent value="appearance">
            <AppearanceTab />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings;
