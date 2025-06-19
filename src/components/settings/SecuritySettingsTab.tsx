
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserCheck, Settings } from "lucide-react";
import { usePasswordManagement } from "@/hooks/usePasswordManagement";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SecuritySettingsTabProps {
  twoFactorAuth: boolean;
  setTwoFactorAuth: (value: boolean) => void;
  passwordExpiry: number[];
  setPasswordExpiry: (value: number[]) => void;
  loginAttempts: number[];
  setLoginAttempts: (value: number[]) => void;
  onSave: () => void;
  userRole?: string;
}

export const SecuritySettingsTab = ({
  twoFactorAuth,
  setTwoFactorAuth,
  passwordExpiry,
  setPasswordExpiry,
  loginAttempts,
  setLoginAttempts,
  onSave,
  userRole
}: SecuritySettingsTabProps) => {
  const { toast } = useToast();
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading: passwordLoading,
    handleUpdatePassword
  } = usePasswordManagement();

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showAdminSection, setShowAdminSection] = useState(false);

  console.log('SecuritySettingsTab rendered with:', { twoFactorAuth, passwordExpiry, loginAttempts, userRole });

  const isAdmin = userRole === 'admin';

  return (
    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-500" />
          Security Settings
        </CardTitle>
        <CardDescription className="text-gray-400">
          Manage your account security preferences and authentication settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Management Section */}
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-2 flex-1">
              <Label className="text-white font-medium">Password Management</Label>
              <p className="text-sm text-gray-400">
                Update your account password for enhanced security
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="bg-purple-600/10 border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
            >
              {showPasswordSection ? 'Hide' : 'Change Password'}
            </Button>
          </div>
          
          {showPasswordSection && (
            <div className="space-y-4 mt-4 pt-4 border-t border-gray-700">
              <div className="space-y-2">
                <Label className="text-white">Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Confirm new password"
                />
              </div>
              <Button
                onClick={handleUpdatePassword}
                disabled={passwordLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Label className="text-white font-medium">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-400">
                Add an extra layer of security to your account with 2FA
              </p>
            </div>
            <Switch
              checked={twoFactorAuth}
              onCheckedChange={(checked) => {
                console.log('Two-factor auth changed to:', checked);
                setTwoFactorAuth(checked);
              }}
              className="data-[state=checked]:bg-purple-600 ml-4"
            />
          </div>
        </div>

        {/* Admin Features Section */}
        {isAdmin && (
          <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-2 flex-1">
                <Label className="text-white font-medium flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-purple-400" />
                  Admin Security Features
                </Label>
                <p className="text-sm text-purple-300">
                  Advanced security controls and administrative tools
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAdminSection(!showAdminSection)}
                className="bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
              >
                {showAdminSection ? 'Hide' : 'Show Admin Tools'}
              </Button>
            </div>

            {showAdminSection && (
              <div className="space-y-4 mt-4 pt-4 border-t border-purple-700/30">
                <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
                  <div>
                    <Label className="text-white font-medium">Password Expiry Policy: {passwordExpiry[0]} days</Label>
                    <p className="text-sm text-gray-400 mb-3">
                      How often users should be required to change their passwords
                    </p>
                    <Slider
                      value={passwordExpiry}
                      onValueChange={(value) => {
                        console.log('Password expiry changed to:', value);
                        setPasswordExpiry(value);
                      }}
                      max={365}
                      min={30}
                      step={30}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
                  <div>
                    <Label className="text-white font-medium">Max Login Attempts: {loginAttempts[0]}</Label>
                    <p className="text-sm text-gray-400 mb-3">
                      Maximum number of failed login attempts before account lockout
                    </p>
                    <Slider
                      value={loginAttempts}
                      onValueChange={(value) => {
                        console.log('Login attempts changed to:', value);
                        setLoginAttempts(value);
                      }}
                      max={10}
                      min={3}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="bg-red-600/10 border-red-500/30 text-red-300 hover:bg-red-600/20"
                    onClick={() => {
                      toast({
                        title: "Admin Feature",
                        description: "Password reset functionality would be implemented here",
                      });
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Reset User Passwords
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="bg-yellow-600/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/20"
                    onClick={() => {
                      toast({
                        title: "Admin Feature",
                        description: "Security audit logs would be displayed here",
                      });
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    View Security Logs
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-orange-900/20 border border-orange-700/50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            </div>
            <div>
              <h4 className="text-orange-200 font-medium mb-1">Security Notice</h4>
              <p className="text-orange-300 text-sm">
                These security settings help protect your account. Enable two-factor authentication for the best protection.
                {isAdmin && " As an admin, you have access to additional security controls."}
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => {
            console.log('Saving security settings...');
            onSave();
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold transition-colors"
        >
          Save Security Settings
        </Button>
      </CardContent>
    </Card>
  );
};
