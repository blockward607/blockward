
import { TabsContent } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "./GeneralSettingsTab";
import { AdminSettingsTab } from "./AdminSettingsTab";
import { NotificationsSettingsTab } from "./NotificationsSettingsTab";
import { SecuritySettingsTab } from "./SecuritySettingsTab";
import { AcademicSettingsTab } from "./AcademicSettingsTab";
import { AppearanceSettingsTab } from "./AppearanceSettingsTab";
import { PrivacySettingsTab } from "./PrivacySettingsTab";
import { InstitutionCodeManagementTab } from "./InstitutionCodeManagementTab";

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

interface EnhancedSettingsContentProps {
  userRole: string | null;
  systemSettings: SystemSettings;
  onUpdateSystemSetting: (category: keyof SystemSettings, settings: any) => void;
  
  // Admin settings
  adminName: string;
  setAdminName: (value: string) => void;
  adminPosition: string;
  setAdminPosition: (value: string) => void;
  adminPermissions: AdminPermissions;
  setAdminPermissions: (value: AdminPermissions) => void;
  onSaveAdminSettings: () => void;
  
  // Institution codes
  institutionCodes: any[];
  loadingCodes: boolean;
  onCreateInstitutionCode: (schoolName: string, contactEmail?: string) => Promise<any>;
  onRefreshCodes: () => void;
}

export const EnhancedSettingsContent = (props: EnhancedSettingsContentProps) => {
  return (
    <div className="mt-6">
      <TabsContent value="general">
        <GeneralSettingsTab
          autoGrading={props.systemSettings.academic.auto_grade_assignments}
          setAutoGrading={(value) => props.onUpdateSystemSetting('academic', { ...props.systemSettings.academic, auto_grade_assignments: value })}
          emailNotifications={props.systemSettings.notifications.email_enabled}
          setEmailNotifications={(value) => props.onUpdateSystemSetting('notifications', { ...props.systemSettings.notifications, email_enabled: value })}
          classSize={[30]}
          setClassSize={() => {}}
          sessionTimeout={[props.systemSettings.security.session_timeout]}
          setSessionTimeout={(value) => props.onUpdateSystemSetting('security', { ...props.systemSettings.security, session_timeout: value[0] })}
          onSave={() => {}}
        />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationsSettingsTab
          settings={props.systemSettings.notifications}
          onUpdate={(settings) => props.onUpdateSystemSetting('notifications', settings)}
        />
      </TabsContent>

      <TabsContent value="security">
        <SecuritySettingsTab
          settings={props.systemSettings.security}
          onUpdate={(settings) => props.onUpdateSystemSetting('security', settings)}
        />
      </TabsContent>

      {props.userRole === 'teacher' && (
        <TabsContent value="academic">
          <AcademicSettingsTab
            settings={props.systemSettings.academic}
            onUpdate={(settings) => props.onUpdateSystemSetting('academic', settings)}
          />
        </TabsContent>
      )}

      <TabsContent value="appearance">
        <AppearanceSettingsTab
          settings={props.systemSettings.appearance}
          onUpdate={(settings) => props.onUpdateSystemSetting('appearance', settings)}
        />
      </TabsContent>

      <TabsContent value="privacy">
        <PrivacySettingsTab
          settings={props.systemSettings.privacy}
          onUpdate={(settings) => props.onUpdateSystemSetting('privacy', settings)}
        />
      </TabsContent>

      {props.userRole === 'admin' && (
        <>
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

          <TabsContent value="institution">
            <InstitutionCodeManagementTab
              institutionCodes={props.institutionCodes}
              loading={props.loadingCodes}
              onCreateCode={props.onCreateInstitutionCode}
              onRefresh={props.onRefreshCodes}
            />
          </TabsContent>
        </>
      )}
    </div>
  );
};
