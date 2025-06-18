
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
import { Settings, Users, Shield, Bell, Database, Palette, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminData } from "@/hooks/useAdminData";

const SettingsPage = () => {
  const { toast } = useToast();
  const { adminProfile, school, loading: adminLoading, updateSchool, updateAdminProfile } = useAdminData();
  
  // User role state
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
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
  
  // School Settings State (for admins)
  const [schoolName, setSchoolName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolWebsite, setSchoolWebsite] = useState("");
  const [announcements, setAnnouncements] = useState("");

  // Admin Settings State
  const [adminName, setAdminName] = useState("");
  const [adminPosition, setAdminPosition] = useState("");
  const [adminPermissions, setAdminPermissions] = useState({
    manage_teachers: true,
    manage_students: true,
    manage_classes: true,
    manage_settings: true
  });

  useEffect(() => {
    checkUserRole();
    loadUserPreferences();
  }, []);

  useEffect(() => {
    if (school) {
      setSchoolName(school.name || "");
      setSchoolEmail(school.contact_email || "");
      setSchoolAddress(school.address || "");
      setSchoolPhone(school.phone || "");
      setSchoolWebsite(school.website || "");
    }
  }, [school]);

  useEffect(() => {
    if (adminProfile) {
      setAdminName(adminProfile.full_name || "");
      setAdminPosition(adminProfile.position || "");
      setAdminPermissions(adminProfile.permissions || {
        manage_teachers: true,
        manage_students: true,
        manage_classes: true,
        manage_settings: true
      });
    }
  }, [adminProfile]);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      setUserRole(roleData?.role || null);
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (preferences) {
        setTheme(preferences.dark_mode ? "dark" : "light");
        setCompactMode(preferences.compact_view || false);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const saveUserPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          dark_mode: theme === "dark",
          compact_view: compactMode,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Preferences Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save preferences.",
      });
    }
  };

  const handleSaveSettings = (settingType: string) => {
    if (settingType === "Appearance") {
      saveUserPreferences();
    } else {
      toast({
        title: "Settings Saved",
        description: `${settingType} settings have been updated successfully.`,
      });
    }
  };

  const handleSaveSchoolSettings = async () => {
    if (!school) return;
    
    await updateSchool({
      name: schoolName,
      contact_email: schoolEmail,
      address: schoolAddress,
      phone: schoolPhone,
      website: schoolWebsite
    });
  };

  const handleSaveAdminSettings = async () => {
    if (!adminProfile) return;
    
    await updateAdminProfile({
      full_name: adminName,
      position: adminPosition,
      permissions: adminPermissions
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

  if (loading || adminLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const isAdmin = userRole === 'admin';
  const isTeacher = userRole === 'teacher';

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-6' : 'grid-cols-4'} bg-gray-800`}>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          {isTeacher && (
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
          )}
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          {isAdmin && (
            <>
              <TabsTrigger value="school" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                School
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
              <CardDescription>Configure your basic preferences</CardDescription>
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
                  <p className="text-sm text-gray-400">Receive email updates about activity</p>
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

        {isTeacher && (
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

                <Button 
                  onClick={() => handleSaveSettings("Student")}
                  className="w-full"
                >
                  Save Student Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

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

        {isAdmin && (
          <>
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
                    <Label className="text-white">School Phone</Label>
                    <Input
                      value={schoolPhone}
                      onChange={(e) => setSchoolPhone(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">School Website</Label>
                    <Input
                      value={schoolWebsite}
                      onChange={(e) => setSchoolWebsite(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="https://..."
                    />
                  </div>

                  <Button 
                    onClick={handleSaveSchoolSettings}
                    className="w-full"
                  >
                    Save School Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Admin Profile Settings</CardTitle>
                  <CardDescription>Manage your administrative profile and permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white">Full Name</Label>
                    <Input
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Position</Label>
                    <Input
                      value={adminPosition}
                      onChange={(e) => setAdminPosition(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="e.g., Principal, Head Teacher, IT Administrator"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-white">Permissions</Label>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white">Manage Teachers</Label>
                        <p className="text-sm text-gray-400">Add, edit, and remove teacher accounts</p>
                      </div>
                      <Switch
                        checked={adminPermissions.manage_teachers}
                        onCheckedChange={(checked) => 
                          setAdminPermissions(prev => ({ ...prev, manage_teachers: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white">Manage Students</Label>
                        <p className="text-sm text-gray-400">Add, edit, and remove student accounts</p>
                      </div>
                      <Switch
                        checked={adminPermissions.manage_students}
                        onCheckedChange={(checked) => 
                          setAdminPermissions(prev => ({ ...prev, manage_students: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white">Manage Classes</Label>
                        <p className="text-sm text-gray-400">Create and manage classroom configurations</p>
                      </div>
                      <Switch
                        checked={adminPermissions.manage_classes}
                        onCheckedChange={(checked) => 
                          setAdminPermissions(prev => ({ ...prev, manage_classes: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white">Manage Settings</Label>
                        <p className="text-sm text-gray-400">Access and modify school-wide settings</p>
                      </div>
                      <Switch
                        checked={adminPermissions.manage_settings}
                        onCheckedChange={(checked) => 
                          setAdminPermissions(prev => ({ ...prev, manage_settings: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveAdminSettings}
                    className="w-full"
                  >
                    Save Admin Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
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
