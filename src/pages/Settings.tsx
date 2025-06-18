import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { User, School, Bell, Shield, Palette, Database } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { SchoolRegistrationForm } from "@/components/school/SchoolRegistrationForm";

const Settings = () => {
  const { toast } = useToast();
  const { userRole, user } = useAuth();
  const [schoolName, setSchoolName] = useState("BlockWard School");
  const [adminName, setAdminName] = useState("Administrator");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [hasSchool, setHasSchool] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserSchoolStatus();
  }, [user]);

  const checkUserSchoolStatus = async () => {
    if (!user) return;
    
    try {
      // Check if user has a school association
      if (userRole === 'admin') {
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('school_id, schools(name)')
          .eq('user_id', user.id)
          .single();
          
        if (adminProfile?.school_id) {
          setHasSchool(true);
          if (adminProfile.schools) {
            setSchoolName(adminProfile.schools.name);
          }
        }
      } else if (userRole === 'teacher') {
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('school_id, schools(name)')
          .eq('user_id', user.id)
          .single();
          
        if (teacherProfile?.school_id) {
          setHasSchool(true);
          if (teacherProfile.schools) {
            setSchoolName(teacherProfile.schools.name);
          }
        }
      }
    } catch (error) {
      console.error('Error checking school status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved successfully."
    });
  };

  const handleSaveSchool = () => {
    toast({
      title: "School Settings Updated", 
      description: "School information has been updated successfully."
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved."
    });
  };

  const handleSaveAppearance = () => {
    toast({
      title: "Appearance Updated",
      description: "Your appearance settings have been saved."
    });
  };

  const handleBackupData = () => {
    toast({
      title: "Backup Started",
      description: "Data backup has been initiated. You'll receive an email when complete."
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started", 
      description: "Data export is being prepared. Download will start shortly."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-gray-800">
            <TabsTrigger value="profile" className="text-white">Profile</TabsTrigger>
            {!hasSchool && userRole !== 'student' && (
              <TabsTrigger value="school-register" className="text-white">Register School</TabsTrigger>
            )}
            {(userRole === 'admin' || (userRole === 'teacher' && hasSchool)) && (
              <TabsTrigger value="school" className="text-white">School</TabsTrigger>
            )}
            <TabsTrigger value="notifications" className="text-white">Notifications</TabsTrigger>
            <TabsTrigger value="appearance" className="text-white">Appearance</TabsTrigger>
            <TabsTrigger value="security" className="text-white">Security</TabsTrigger>
            <TabsTrigger value="data" className="text-white">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <User className="w-5 h-5" />
                  <span>Profile Settings</span>
                </CardTitle>
                <CardDescription>Manage your personal account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">Full Name</Label>
                  <Input 
                    id="fullName"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-gray-700 border-gray-600 text-white opacity-60"
                  />
                </div>
                <Button onClick={handleSaveProfile} className="bg-purple-600 hover:bg-purple-700">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {!hasSchool && userRole !== 'student' && (
            <TabsContent value="school-register">
              <SchoolRegistrationForm />
            </TabsContent>
          )}

          {(userRole === 'admin' || (userRole === 'teacher' && hasSchool)) && (
            <TabsContent value="school">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <School className="w-5 h-5" />
                    <span>School Settings</span>
                  </CardTitle>
                  <CardDescription>Configure your school information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName" className="text-white">School Name</Label>
                    <Input 
                      id="schoolName"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      disabled={userRole !== 'admin'}
                    />
                  </div>
                  {userRole === 'admin' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="schoolAddress" className="text-white">Address</Label>
                        <Input 
                          id="schoolAddress"
                          placeholder="School address"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schoolPhone" className="text-white">Phone Number</Label>
                        <Input 
                          id="schoolPhone"
                          placeholder="School phone number"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <Button onClick={handleSaveSchool} className="bg-purple-600 hover:bg-purple-700">
                        Save School Settings
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="notifications">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Bell className="w-5 h-5" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications" className="text-white">Email Notifications</Label>
                  <Switch 
                    id="emailNotifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifications" className="text-white">Push Notifications</Label>
                  <Switch id="pushNotifications" defaultChecked />
                </div>
                <Button onClick={handleSaveNotifications} className="bg-purple-600 hover:bg-purple-700">
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Palette className="w-5 h-5" />
                  <span>Appearance</span>
                </CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode" className="text-white">Dark Mode</Label>
                  <Switch 
                    id="darkMode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="compactView" className="text-white">Compact View</Label>
                  <Switch id="compactView" />
                </div>
                <Button onClick={handleSaveAppearance} className="bg-purple-600 hover:bg-purple-700">
                  Save Appearance Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Shield className="w-5 h-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Change Password
                </Button>
                <Button variant="outline" className="border-gray-600 text-white">
                  Enable Two-Factor Authentication
                </Button>
                <Button variant="outline" className="border-gray-600 text-white">
                  View Login History
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Database className="w-5 h-5" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>Backup and export your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleBackupData} className="bg-green-600 hover:bg-green-700">
                  Backup Data
                </Button>
                <Button onClick={handleExportData} variant="outline" className="border-gray-600 text-white">
                  Export Data
                </Button>
                <Button variant="destructive">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
