
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, Users, Shield, Palette, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab";
import { AppearanceSettingsTab } from "@/components/settings/AppearanceSettingsTab";
import { SecuritySettingsTab } from "@/components/settings/SecuritySettingsTab";
import { AdminSettingsTab } from "@/components/settings/AdminSettingsTab";
import { StudentsSettingsTab } from "@/components/settings/StudentsSettingsTab";

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
  const [activeTab, setActiveTab] = useState("general");
  
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
    console.log('Settings page mounted, loading user data...');
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('Checking session...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found');
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

  const handleTabChange = (value: string) => {
    console.log('Tab change triggered:', value);
    console.log('Current activeTab before change:', activeTab);
    setActiveTab(value);
    console.log('Tab changed to:', value);
  };

  // Debug click handler
  const handleTabClick = (value: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Tab clicked:', value);
    console.log('Click event:', event);
    handleTabChange(value);
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

  console.log('Rendering settings page with role:', userRole, 'activeTab:', activeTab);

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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="flex w-full bg-muted p-1 rounded-md">
          <TabsTrigger 
            value="general" 
            onClick={(e) => handleTabClick('general', e)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger 
            value="security"
            onClick={(e) => handleTabClick('security', e)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="appearance"
            onClick={(e) => handleTabClick('appearance', e)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger 
            value="students"
            onClick={(e) => handleTabClick('students', e)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger 
              value="admin"
              onClick={(e) => handleTabClick('admin', e)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              <Building className="h-4 w-4" />
              Admin
            </TabsTrigger>
          )}
        </TabsList>

        <div className="mt-6">
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
              userRole={userRole}
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

          <TabsContent value="students">
            <StudentsSettingsTab
              studentRegistration={studentRegistration}
              setStudentRegistration={setStudentRegistration}
              onSave={saveUserPreferences}
            />
          </TabsContent>

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
        </div>
      </Tabs>

      <div className="mt-8 flex justify-center">
        <Button 
          onClick={handleResetSettings}
          variant="destructive"
          className="px-8 bg-red-600 hover:bg-red-700 text-white"
        >
          Reset All Settings to Default
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
