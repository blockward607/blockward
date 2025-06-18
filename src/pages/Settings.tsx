
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, Users, Shield, Bell, Database, Palette } from "lucide-react";

const SettingsPage = () => {
  const { toast } = useToast();
  
  // General Settings State
  const [autoGrading, setAutoGrading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [studentRegistration, setStudentRegistration] = useState(false);
  const [classSize, setClassSize] = useState([30]);
  const [sessionTimeout, setSessionTimeout] = useState([60]);
  
  // Appearance Settings State
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState([14]);
  const [compactMode, setCompactMode] = useState(false);
  
  // Security Settings State
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState([90]);
  const [loginAttempts, setLoginAttempts] = useState([5]);
  
  // School Settings State
  const [schoolName, setSchoolName] = useState("BlockWard School");
  const [schoolEmail, setSchoolEmail] = useState("admin@blockward.edu");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [announcements, setAnnouncements] = useState("");

  const handleSaveSettings = (settingType: string) => {
    toast({
      title: "Settings Saved",
      description: `${settingType} settings have been updated successfully.`,
    });
  };

  const handleResetSettings = () => {
    setAutoGrading(true);
    setEmailNotifications(true);
    setStudentRegistration(false);
    setClassSize([30]);
    setSessionTimeout([60]);
    setTheme("dark");
    setFontSize([14]);
    setCompactMode(false);
    setTwoFactorAuth(false);
    setPasswordExpiry([90]);
    setLoginAttempts([5]);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export is being prepared. You'll receive an email when it's ready.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import Ready",
      description: "Please select a file to import your data.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8 text-purple-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">Teacher Settings</h1>
          <p className="text-gray-400">Manage your classroom and administrative preferences</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="school" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            School
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
              <CardDescription>Configure your basic teaching preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white">Auto-grading</Label>
                  <p className="text-sm text-gray-400">Automatically grade multiple choice assignments</p>
                </div>
                <Switch
                  checked={autoGrading}
                  onCheckedChange={setAutoGrading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white">Email Notifications</Label>
                  <p className="text-sm text-gray-400">Receive email updates about student activity</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white">Maximum Class Size: {classSize[0]} students</Label>
                <Slider
                  value={classSize}
                  onValueChange={setClassSize}
                  max={50}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white">Session Timeout: {sessionTimeout[0]} minutes</Label>
                <Slider
                  value={sessionTimeout}
                  onValueChange={setSessionTimeout}
                  max={180}
                  min={15}
                  step={15}
                  className="w-full"
                />
              </div>

              <Button 
                onClick={() => handleSaveSettings("General")}
                className="w-full"
              >
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Student Management</CardTitle>
              <CardDescription>Control how students interact with your classes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white">Allow Student Self-Registration</Label>
                  <p className="text-sm text-gray-400">Let students join classes using invitation codes</p>
                </div>
                <Switch
                  checked={studentRegistration}
                  onCheckedChange={setStudentRegistration}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleExportData}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  Export Student Data
                </Button>
                <Button 
                  onClick={handleImportData}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  Import Student Data
                </Button>
              </div>

              <Button 
                onClick={() => handleSaveSettings("Student")}
                className="w-full"
              >
                Save Student Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Settings</CardTitle>
              <CardDescription>Manage your account security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={twoFactorAuth}
                  onCheckedChange={setTwoFactorAuth}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white">Password Expiry: {passwordExpiry[0]} days</Label>
                <Slider
                  value={passwordExpiry}
                  onValueChange={setPasswordExpiry}
                  max={365}
                  min={30}
                  step={30}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white">Max Login Attempts: {loginAttempts[0]}</Label>
                <Slider
                  value={loginAttempts}
                  onValueChange={setLoginAttempts}
                  max={10}
                  min={3}
                  step={1}
                  className="w-full"
                />
              </div>

              <Button 
                onClick={() => handleSaveSettings("Security")}
                className="w-full"
              >
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-white">Font Size: {fontSize[0]}px</Label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  max={20}
                  min={12}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white">Compact Mode</Label>
                  <p className="text-sm text-gray-400">Use a more compact interface layout</p>
                </div>
                <Switch
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                />
              </div>

              <Button 
                onClick={() => handleSaveSettings("Appearance")}
                className="w-full"
              >
                Save Appearance Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="school">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">School Settings</CardTitle>
              <CardDescription>Manage school-wide configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white">School Name</Label>
                <Input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">School Email</Label>
                <Input
                  type="email"
                  value={schoolEmail}
                  onChange={(e) => setSchoolEmail(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">School Address</Label>
                <Textarea
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">School Announcements</Label>
                <Textarea
                  value={announcements}
                  onChange={(e) => setAnnouncements(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={4}
                  placeholder="Enter school-wide announcements..."
                />
              </div>

              <Button 
                onClick={() => handleSaveSettings("School")}
                className="w-full"
              >
                Save School Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-center">
        <Button 
          onClick={handleResetSettings}
          variant="destructive"
          className="px-8"
        >
          Reset All Settings to Default
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
