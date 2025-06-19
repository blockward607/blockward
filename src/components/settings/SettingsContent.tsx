import { TabsContent } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "./GeneralSettingsTab";
import { AdminSettingsTab } from "./AdminSettingsTab";

interface AdminPermissions {
  manage_teachers: boolean;
  manage_students: boolean;
  manage_classes: boolean;
  manage_settings: boolean;
}

interface SettingsContentProps {
  userRole: string | null;
  isAdmin: boolean;
  
  // General settings
  autoGrading: boolean;
  setAutoGrading: (value: boolean) => void;
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  classSize: number[];
  setClassSize: (value: number[]) => void;
  sessionTimeout: number[];
  setSessionTimeout: (value: number[]) => void;
  
  // Security settings (keeping for backward compatibility but not using)
  twoFactorAuth: boolean;
  setTwoFactorAuth: (value: boolean) => void;
  passwordExpiry: number[];
  setPasswordExpiry: (value: number[]) => void;
  loginAttempts: number[];
  setLoginAttempts: (value: number[]) => void;
  
  // Appearance settings (keeping for backward compatibility but not using)
  theme: string;
  setTheme: (value: string) => void;
  fontSize: number[];
  setFontSize: (value: number[]) => void;
  compactMode: boolean;
  setCompactMode: (value: boolean) => void;
  
  // Student settings (keeping for backward compatibility but not using)
  studentRegistration: boolean;
  setStudentRegistration: (value: boolean) => void;
  
  // Admin settings
  adminName: string;
  setAdminName: (value: string) => void;
  adminPosition: string;
  setAdminPosition: (value: string) => void;
  adminPermissions: AdminPermissions;
  setAdminPermissions: (value: AdminPermissions) => void;
  
  // Action handlers
  onSaveUserPreferences: () => void;
  onSaveSecuritySettings: () => void;
  onSaveAdminSettings: () => void;
}

export const SettingsContent = (props: SettingsContentProps) => {
  return (
    <div className="mt-6">
      <TabsContent value="general">
        <GeneralSettingsTab
          autoGrading={props.autoGrading}
          setAutoGrading={props.setAutoGrading}
          emailNotifications={props.emailNotifications}
          setEmailNotifications={props.setEmailNotifications}
          classSize={props.classSize}
          setClassSize={props.setClassSize}
          sessionTimeout={props.sessionTimeout}
          setSessionTimeout={props.setSessionTimeout}
          onSave={props.onSaveUserPreferences}
        />
      </TabsContent>

      {props.isAdmin && (
        <TabsContent value="admin">
          <AdminSettingsTab
            adminName={props.adminName}
            setAdminName={props.setAdminName}
            adminPosition={props.adminPosition}
            setAdminPosition={props.setAdminPosition}
            adminPermissions={props.adminPermissions}
            setAdminPermissions={props.setAdminPermissions}
            onSave={props.onSaveAdminSettings}
          />
        </TabsContent>
      )}
    </div>
  );
};
