
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { useEnhancedSettingsState } from "@/hooks/useEnhancedSettingsState";
import { useSettingsActions } from "@/hooks/useSettingsActions";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { EnhancedSettingsTabsList } from "@/components/settings/EnhancedSettingsTabsList";
import { EnhancedSettingsContent } from "@/components/settings/EnhancedSettingsContent";

const SettingsPage = () => {
  const {
    userRole,
    loading,
    activeTab,
    setActiveTab,
    systemSettings,
    updateSystemSetting,
    adminName,
    setAdminName,
    adminPosition,
    setAdminPosition,
    adminPermissions,
    setAdminPermissions,
    institutionCodes,
    loadingCodes,
    createInstitutionCode,
    loadInstitutionCodes
  } = useEnhancedSettingsState();

  const {
    saveAdminSettings,
    handleResetSettings
  } = useSettingsActions({
    theme: systemSettings.appearance.theme,
    compactMode: systemSettings.appearance.compact_mode,
    adminName,
    adminPosition,
    adminPermissions,
    userRole,
    setAutoGrading: (value) => updateSystemSetting('academic', { ...systemSettings.academic, auto_grade_assignments: value }),
    setEmailNotifications: (value) => updateSystemSetting('notifications', { ...systemSettings.notifications, email_enabled: value }),
    setStudentRegistration: () => {},
    setClassSize: () => {},
    setSessionTimeout: (value) => updateSystemSetting('security', { ...systemSettings.security, session_timeout: value[0] }),
    setTheme: (value) => updateSystemSetting('appearance', { ...systemSettings.appearance, theme: value }),
    setFontSize: (value) => updateSystemSetting('appearance', { ...systemSettings.appearance, font_size: value[0] }),
    setCompactMode: (value) => updateSystemSetting('appearance', { ...systemSettings.appearance, compact_mode: value }),
    setTwoFactorAuth: (value) => updateSystemSetting('security', { ...systemSettings.security, require_2fa: value }),
    setPasswordExpiry: () => {},
    setLoginAttempts: (value) => updateSystemSetting('security', { ...systemSettings.security, max_login_attempts: value[0] })
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <SettingsHeader userRole={userRole} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <EnhancedSettingsTabsList userRole={userRole} />

        <EnhancedSettingsContent
          userRole={userRole}
          systemSettings={systemSettings}
          onUpdateSystemSetting={updateSystemSetting}
          adminName={adminName}
          setAdminName={setAdminName}
          adminPosition={adminPosition}
          setAdminPosition={setAdminPosition}
          adminPermissions={adminPermissions}
          setAdminPermissions={setAdminPermissions}
          onSaveAdminSettings={saveAdminSettings}
          institutionCodes={institutionCodes}
          loadingCodes={loadingCodes}
          onCreateInstitutionCode={createInstitutionCode}
          onRefreshCodes={loadInstitutionCodes}
        />
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
