import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, Users, Shield, Bell, Database, Palette, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab";
import { AppearanceSettingsTab } from "@/components/settings/AppearanceSettingsTab";
import { SecuritySettingsTab } from "@/components/settings/SecuritySettingsTab";
import { AdminSettingsTab } from "@/components/settings/AdminSettingsTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AdminPermissions {
  manage_teachers: boolean;
  manage_students: boolean;
  manage_classes: boolean;
  manage_settings: boolean;
}

const SettingsPage = () => {
  const { toast } = useToast();
  
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
  
  // School Settings State
  const [schoolName, setSchoolName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolWebsite, setSchoolWebsite] = useState("");

  // Admin Settings State
  const [adminName, setAdminName] = useState("");
  const [adminPosition, setAdminPosition] = useState("");
  const [adminPermissions, setAdminPermissions] = useState<AdminPermissions>({
    manage_teachers: true,
    manage_students: true,
    manage_classes: true,
    manage_settings: true
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      console.log('Loading user data for:', session.user.id);

      // Check user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const role = roleData?.role || 'student';
      setUserRole(role);
      console.log('User role:', role);

      // Load user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (preferences) {
        console.log('Loaded preferences:', preferences);
        setTheme(preferences.dark_mode ? "dark" : "light");
        setCompactMode(preferences.compact_view || false);
      }

      // Load admin data only if user is admin
      if (role === 'admin') {
        console.log('Loading admin data...');
        const { data: adminData } = await supabase
          .from('admin_profiles')
          .select(`
            *,
            schools (*)
          `)
          .eq('user_id', session.user.id)
          .single();

        if (adminData) {
          console.log('Loaded admin data:', adminData);
          setAdminName(adminData.full_name || "");
          setAdminPosition(adminData.position || "");
          
          if (adminData.permissions && typeof adminData.permissions === 'object') {
            const permissions = adminData.permissions as any;
            setAdminPermissions({
              manage_teachers: permissions.manage_teachers ?? true,
              manage_students: permissions.manage_students ?? true,
              manage_classes: permissions.manage_classes ?? true,
              manage_settings: permissions.manage_settings ?? true
            });
          }

          if (adminData.schools) {
            setSchoolName(adminData.schools.name || "");
            setSchoolEmail(adminData.schools.contact_email || "");
            setSchoolAddress(adminData.schools.address || "");
            setSchoolPhone(adminData.schools.phone || "");
            setSchoolWebsite(adminData.schools.website || "");
          }
        }
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load settings data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveUserPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log('Saving user preferences...');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          dark_mode: theme === "dark",
          compact_view: compactMode,
          tutorial_completed: false,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log('Preferences saved successfully');
      toast({
        title: "Settings Saved",
        description: "Your preferences have been saved successfully.",
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

  const saveAdminSettings = async () => {
    if (userRole !== 'admin') return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log('Saving admin settings...');

      const { error } = await supabase
        .from('admin_profiles')
        .update({
          full_name: adminName,
          position: adminPosition,
          permissions: adminPermissions as any
        })
        .eq('user_id', session.user.id);

      if (error) throw error;

      console.log('Admin settings saved successfully');
      toast({
        title: "Admin Settings Saved",
        description: "Admin profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving admin settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save admin settings.",
      });
    }
  };

  const saveSecuritySettings = () => {
    console.log('Security settings saved (local only)');
    toast({
      title: "Security Settings Saved",
      description: "Your security preferences have been updated.",
    });
  };

  const handleResetSettings = () => {
    console.log('Resetting settings to defaults...');
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

  if (loading) {
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
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : isTeacher ? 'grid-cols-4' : 'grid-cols-3'} bg-gray-800`}>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          {isTeacher && (
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
          <GeneralSettingsTab
            autoGrading={autoGrading}
            setAutoGrading={setAutoGrading}
            emailNotifications={emailNotifications}
            setEmailNotifications={setEmailNotifications}
            classSize={classSize}
            setClassSize={setClassSize}
            sessionTimeout={sessionTimeout}
            setSessionTimeout={setSessionTimeout}
            onSave={saveUserPreferences}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettingsTab
            twoFactorAuth={twoFactorAuth}
            setTwoFactorAuth={setTwoFactorAuth}
            passwordExpiry={passwordExpiry}
            setPasswordExpiry={setPasswordExpiry}
            loginAttempts={loginAttempts}
            setLoginAttempts={setLoginAttempts}
            onSave={saveSecuritySettings}
          />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceSettingsTab
            theme={theme}
            setTheme={setTheme}
            fontSize={fontSize}
            setFontSize={setFontSize}
            compactMode={compactMode}
            setCompactMode={setCompactMode}
            onSave={saveUserPreferences}
          />
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
                  onClick={saveUserPreferences}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Save Student Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="admin">
            <AdminSettingsTab
              adminName={adminName}
              setAdminName={setAdminName}
              adminPosition={adminPosition}
              setAdminPosition={setAdminPosition}
              adminPermissions={adminPermissions}
              setAdminPermissions={setAdminPermissions}
              onSave={saveAdminSettings}
            />
          </TabsContent>
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
