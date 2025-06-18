
import { Settings as SettingsIcon, Bell, Shield, Palette, User, Award, Calendar, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Import our custom components
import ProfileTab from "@/components/settings/ProfileTab";
import { AppearanceTab } from "@/components/settings/AppearanceTab";
import SecurityTab from "@/components/settings/SecurityTab";
import { TeacherAdminTab } from "@/components/settings/TeacherAdminTab";
import { AdminAccessButton } from "@/components/admin/AdminAccessButton";

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

      {/* Admin Access Section */}
      <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-400" />
            <div>
              <h3 className="text-xl font-semibold text-white">Admin Features</h3>
              <p className="text-gray-300">Access advanced administrative controls and management tools</p>
            </div>
          </div>
          <div className="space-y-2">
            <AdminAccessButton />
          </div>
        </div>
      </Card>

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
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="admin">Teacher Admin</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="admin">
            <TeacherAdminTab />
          </TabsContent>

          <TabsContent value="appearance">
            <AppearanceTab />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-6 py-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Email Notifications</h4>
                    <p className="text-sm text-gray-400">Receive notifications via email</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Push Notifications</h4>
                    <p className="text-sm text-gray-400">Browser push notifications</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Class Announcements</h4>
                    <p className="text-sm text-gray-400">Get notified of new announcements</p>
                  </div>
                  <Button variant="outline">Settings</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings;
