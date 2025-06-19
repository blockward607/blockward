
import { TabsContent } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "./GeneralSettingsTab";
import { SecuritySettingsTab } from "./SecuritySettingsTab";
import { AppearanceSettingsTab } from "./AppearanceSettingsTab";
import { StudentsSettingsTab } from "./StudentsSettingsTab";
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
  
  // Security settings
  twoFactorAuth: boolean;
  setTwoFactorAuth: (value: boolean) => void;
  passwordExpiry: number[];
  setPasswordExpiry: (value: number[]) => void;
  loginAttempts: number[];
  setLoginAttempts: (value: number[]) => void;
  
  // Appearance settings
  theme: string;
  setTheme: (value: string) => void;
  fontSize: number[];
  setFontSize: (value: number[]) => void;
  compactMode: boolean;
  setCompactMode: (value: boolean) => void;
  
  // Student settings
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

      <TabsContent value="security">
        <SecuritySettingsTab
          twoFactorAuth={props.twoFactorAuth}
          setTwoFactorAuth={props.setTwoFactorAuth}
          passwordExpiry={props.passwordExpiry}
          setPasswordExpiry={props.setPasswordExpiry}
          loginAttempts={props.loginAttempts}
          setLoginAttempts={props.setLoginAttempts}
          onSave={props.onSaveSecuritySettings}
          userRole={props.userRole}
        />
      </TabsContent>

      <TabsContent value="appearance">
        <AppearanceSettingsTab
          theme={props.theme}
          setTheme={props.setTheme}
          fontSize={props.fontSize}
          setFontSize={props.setFontSize}
          compactMode={props.compactMode}
          setCompactMode={props.setCompactMode}
          onSave={props.onSaveUserPreferences}
        />
      </TabsContent>

      <TabsContent value="students">
        <StudentsSettingsTab
          studentRegistration={props.studentRegistration}
          setStudentRegistration={props.setStudentRegistration}
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
