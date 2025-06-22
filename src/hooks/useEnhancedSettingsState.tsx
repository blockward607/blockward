
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminPermissions {
  manage_teachers: boolean;
  manage_students: boolean;
  manage_classes: boolean;
  manage_settings: boolean;
}

interface SystemSettings {
  notifications: {
    email_enabled: boolean;
    push_enabled: boolean;
    digest_frequency: string;
  };
  security: {
    session_timeout: number;
    max_login_attempts: number;
    require_2fa: boolean;
  };
  academic: {
    grading_scale: string;
    attendance_tracking: boolean;
    auto_grade_assignments: boolean;
  };
  appearance: {
    theme: string;
    font_size: number;
    compact_mode: boolean;
    language: string;
  };
  privacy: {
    profile_visibility: string;
    data_sharing: boolean;
    analytics_opt_in: boolean;
  };
}

interface InstitutionCodeResponse {
  success: boolean;
  institution_code?: string;
  school_id?: string;
  school_name?: string;
  error?: string;
}

export const useEnhancedSettingsState = () => {
  const { toast } = useToast();
  
  // User role state
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  
  // System settings state
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    notifications: {
      email_enabled: true,
      push_enabled: false,
      digest_frequency: 'daily'
    },
    security: {
      session_timeout: 60,
      max_login_attempts: 5,
      require_2fa: false
    },
    academic: {
      grading_scale: 'A-F',
      attendance_tracking: true,
      auto_grade_assignments: false
    },
    appearance: {
      theme: 'dark',
      font_size: 14,
      compact_mode: false,
      language: 'en'
    },
    privacy: {
      profile_visibility: 'school',
      data_sharing: false,
      analytics_opt_in: true
    }
  });

  // Admin Settings State
  const [adminName, setAdminName] = useState("");
  const [adminPosition, setAdminPosition] = useState("");
  const [adminPermissions, setAdminPermissions] = useState<AdminPermissions>({
    manage_teachers: true,
    manage_students: true,
    manage_classes: true,
    manage_settings: true
  });

  // Institution codes state
  const [institutionCodes, setInstitutionCodes] = useState<any[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);

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

      // Check user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const role = roleData?.role || 'student';
      setUserRole(role);

      // Load system settings
      const { data: settingsData } = await supabase.rpc('get_system_settings');
      if (settingsData && settingsData.length > 0) {
        const settings = settingsData.reduce((acc: any, item: any) => {
          acc[item.setting_key] = item.setting_value;
          return acc;
        }, {});
        
        setSystemSettings(prevSettings => ({
          ...prevSettings,
          ...settings
        }));
      }

      // Load user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (preferences) {
        setSystemSettings(prev => ({
          ...prev,
          appearance: {
            ...prev.appearance,
            theme: preferences.dark_mode ? "dark" : "light",
            compact_mode: preferences.compact_view || false
          }
        }));
      }

      // Load admin data if user is admin
      if (role === 'admin') {
        const { data: adminData } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (adminData) {
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

        // Load institution codes for admin
        await loadInstitutionCodes();
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

  const loadInstitutionCodes = async () => {
    setLoadingCodes(true);
    try {
      const { data, error } = await supabase.rpc('get_admin_institution_codes');
      if (error) throw error;
      setInstitutionCodes(data || []);
    } catch (error) {
      console.error('Error loading institution codes:', error);
    } finally {
      setLoadingCodes(false);
    }
  };

  const updateSystemSetting = async (category: keyof SystemSettings, settings: any) => {
    try {
      const { error } = await supabase.rpc('update_system_setting', {
        p_setting_key: category,
        p_setting_value: settings
      });

      if (error) throw error;

      setSystemSettings(prev => ({
        ...prev,
        [category]: { ...prev[category], ...settings }
      }));

      toast({
        title: "Settings Updated",
        description: `${category} settings have been saved successfully.`
      });
    } catch (error) {
      console.error('Error updating system setting:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update settings."
      });
    }
  };

  const createInstitutionCode = async (schoolName: string, contactEmail?: string) => {
    try {
      const { data, error } = await supabase.rpc('admin_create_institution_code', {
        p_school_name: schoolName,
        p_contact_email: contactEmail
      });

      if (error) throw error;

      // Type assertion for the response
      const response = data as InstitutionCodeResponse;

      if (response.success) {
        toast({
          title: "Institution Code Created",
          description: `New code: ${response.institution_code}`
        });
        await loadInstitutionCodes();
        return response;
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      console.error('Error creating institution code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create institution code"
      });
      return null;
    }
  };

  return {
    // User state
    userRole,
    loading,
    activeTab,
    setActiveTab,
    
    // System settings
    systemSettings,
    updateSystemSetting,
    
    // Admin settings
    adminName,
    setAdminName,
    adminPosition,
    setAdminPosition,
    adminPermissions,
    setAdminPermissions,
    
    // Institution codes
    institutionCodes,
    loadingCodes,
    createInstitutionCode,
    loadInstitutionCodes,
    
    // Utility functions
    loadUserData
  };
};
