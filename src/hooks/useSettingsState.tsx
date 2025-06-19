
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminPermissions {
  manage_teachers: boolean;
  manage_students: boolean;
  manage_classes: boolean;
  manage_settings: boolean;
}

export const useSettingsState = () => {
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

  return {
    // User state
    userRole,
    loading,
    activeTab,
    setActiveTab,
    
    // General settings
    autoGrading,
    setAutoGrading,
    emailNotifications,
    setEmailNotifications,
    studentRegistration,
    setStudentRegistration,
    classSize,
    setClassSize,
    sessionTimeout,
    setSessionTimeout,
    
    // Appearance settings
    theme,
    setTheme,
    fontSize,
    setFontSize,
    compactMode,
    setCompactMode,
    
    // Security settings
    twoFactorAuth,
    setTwoFactorAuth,
    passwordExpiry,
    setPasswordExpiry,
    loginAttempts,
    setLoginAttempts,
    
    // Admin settings
    adminName,
    setAdminName,
    adminPosition,
    setAdminPosition,
    adminPermissions,
    setAdminPermissions,
    
    // Utility functions
    loadUserData
  };
};
