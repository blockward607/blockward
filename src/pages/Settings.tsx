
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { useSettingsState } from "@/hooks/useSettingsState";
import { useSettingsActions } from "@/hooks/useSettingsActions";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsTabsList } from "@/components/settings/SettingsTabsList";
import { SettingsContent } from "@/components/settings/SettingsContent";

const SettingsPage = () => {
  const {
    userRole,
    loading,
    activeTab,
    setActiveTab,
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
    theme,
    setTheme,
    fontSize,
    setFontSize,
    compactMode,
    setCompactMode,
    twoFactorAuth,
    setTwoFactorAuth,
    passwordExpiry,
    setPasswordExpiry,
    loginAttempts,
    setLoginAttempts,
    adminName,
    setAdminName,
    adminPosition,
    setAdminPosition,
    adminPermissions,
    setAdminPermissions
  } = useSettingsState();

  const {
    saveUserPreferences,
    saveAdminSettings,
    saveSecuritySettings,
    handleResetSettings
  } = useSettingsActions({
    theme,
    compactMode,
    adminName,
    adminPosition,
    adminPermissions,
    userRole,
    setAutoGrading,
    setEmailNotifications,
    setStudentRegistration,
    setClassSize,
    setSessionTimeout,
    setTheme,
    setFontSize,
    setCompactMode,
    setTwoFactorAuth,
    setPasswordExpiry,
    setLoginAttempts
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const isAdmin = userRole === 'admin';

  console.log('Rendering settings page with role:', userRole, 'activeTab:', activeTab);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <SettingsHeader userRole={userRole} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <SettingsTabsList isAdmin={isAdmin} />

        <SettingsContent
          userRole={userRole}
          isAdmin={isAdmin}
          autoGrading={autoGrading}
          setAutoGrading={setAutoGrading}
          emailNotifications={emailNotifications}
          setEmailNotifications={setEmailNotifications}
          classSize={classSize}
          setClassSize={setClassSize}
          sessionTimeout={sessionTimeout}
          setSessionTimeout={setSessionTimeout}
          twoFactorAuth={twoFactorAuth}
          setTwoFactorAuth={setTwoFactorAuth}
          passwordExpiry={passwordExpiry}
          setPasswordExpiry={setPasswordExpiry}
          loginAttempts={loginAttempts}
          setLoginAttempts={setLoginAttempts}
          theme={theme}
          setTheme={setTheme}
          fontSize={fontSize}
          setFontSize={setFontSize}
          compactMode={compactMode}
          setCompactMode={setCompactMode}
          studentRegistration={studentRegistration}
          setStudentRegistration={setStudentRegistration}
          adminName={adminName}
          setAdminName={setAdminName}
          adminPosition={adminPosition}
          setAdminPosition={setAdminPosition}
          adminPermissions={adminPermissions}
          setAdminPermissions={setAdminPermissions}
          onSaveUserPreferences={saveUserPreferences}
          onSaveSecuritySettings={saveSecuritySettings}
          onSaveAdminSettings={saveAdminSettings}
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
