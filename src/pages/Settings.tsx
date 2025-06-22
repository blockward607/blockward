
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
          <div className="absolute inset-0 rounded-full h-32 w-32 border-t-2 border-blue-400 animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto p-6 max-w-6xl">
        <div className="backdrop-blur-sm bg-slate-800/30 rounded-2xl border border-slate-700/50 shadow-2xl">
          <div className="p-8">
            <SettingsHeader userRole={userRole} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="relative">
                <EnhancedSettingsTabsList userRole={userRole} />
                {/* Active tab indicator glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg blur opacity-30 pointer-events-none"></div>
              </div>

              <div className="relative">
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
              </div>
            </Tabs>
          </div>

          {/* Enhanced reset button section */}
          <div className="border-t border-slate-700/50 bg-slate-800/20 p-8 rounded-b-2xl">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                <Button 
                  onClick={handleResetSettings}
                  variant="destructive"
                  className="relative px-8 py-3 bg-red-600/90 hover:bg-red-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
                >
                  <span className="flex items-center gap-2">
                    🔄 Reset All Settings to Default
                  </span>
                </Button>
              </div>
            </div>
            <p className="text-center text-gray-400 text-sm mt-3">
              This action cannot be undone. All your customizations will be lost.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
