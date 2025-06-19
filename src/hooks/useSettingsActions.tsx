
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminPermissions {
  manage_teachers: boolean;
  manage_students: boolean;
  manage_classes: boolean;
  manage_settings: boolean;
}

interface UseSettingsActionsProps {
  theme: string;
  compactMode: boolean;
  adminName: string;
  adminPosition: string;
  adminPermissions: AdminPermissions;
  userRole: string | null;
  setAutoGrading: (value: boolean) => void;
  setEmailNotifications: (value: boolean) => void;
  setStudentRegistration: (value: boolean) => void;
  setClassSize: (value: number[]) => void;
  setSessionTimeout: (value: number[]) => void;
  setTheme: (value: string) => void;
  setFontSize: (value: number[]) => void;
  setCompactMode: (value: boolean) => void;
  setTwoFactorAuth: (value: boolean) => void;
  setPasswordExpiry: (value: number[]) => void;
  setLoginAttempts: (value: number[]) => void;
}

export const useSettingsActions = (props: UseSettingsActionsProps) => {
  const { toast } = useToast();

  const saveUserPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log('Saving user preferences...');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          dark_mode: props.theme === "dark",
          compact_view: props.compactMode,
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
    if (props.userRole !== 'admin') return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log('Saving admin settings...');

      const { error } = await supabase
        .from('admin_profiles')
        .update({
          full_name: props.adminName,
          position: props.adminPosition,
          permissions: props.adminPermissions as any
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
    props.setAutoGrading(true);
    props.setEmailNotifications(true);
    props.setStudentRegistration(false);
    props.setClassSize([30]);
    props.setSessionTimeout([60]);
    props.setTheme("dark");
    props.setFontSize([14]);
    props.setCompactMode(false);
    props.setTwoFactorAuth(false);
    props.setPasswordExpiry([90]);
    props.setLoginAttempts([5]);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  return {
    saveUserPreferences,
    saveAdminSettings,
    saveSecuritySettings,
    handleResetSettings
  };
};
