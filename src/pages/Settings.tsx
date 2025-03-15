import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, Shield, Palette, User, LogOut, Award, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }
        
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
          
        if (userRole?.role === 'teacher') {
          const { data: profile, error } = await supabase
            .from('teacher_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          if (profile) {
            setFullName(profile.full_name || '');
            setSchool(profile.school || '');
            setSubject(profile.subject || '');
          }
        } else {
          const { data: profile, error } = await supabase
            .from('students')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          if (profile) {
            setFullName(profile.name || '');
            setSchool(profile.school || '');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user profile"
        });
      } finally {
        setProfileLoading(false);
      }
    };
    
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
      document.documentElement.classList.toggle('dark', savedDarkMode === 'true');
    }
    
    const savedCompactView = localStorage.getItem('compactView');
    if (savedCompactView !== null) {
      setCompactView(savedCompactView === 'true');
    }
    
    fetchUserProfile();
  }, [navigate, toast]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
        
      if (userRole?.role === 'teacher') {
        const { error } = await supabase
          .from('teacher_profiles')
          .update({
            full_name: fullName,
            school: school,
            subject: subject,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('students')
          .update({
            name: fullName,
            school: school
          })
          .eq('user_id', session.user.id);
          
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match"
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Password updated successfully"
      });
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update password"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', String(enabled));
    document.documentElement.classList.toggle('dark', enabled);
    
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggleCompactView = (enabled: boolean) => {
    setCompactView(enabled);
    localStorage.setItem('compactView', String(enabled));
    
    document.body.classList.toggle('compact-view', enabled);
  };

  const handleSaveNotificationSettings = () => {
    localStorage.setItem('emailNotifications', String(emailNotifications));
    localStorage.setItem('achievementAlerts', String(achievementAlerts));
    
    toast({
      title: "Success",
      description: "Notification settings saved"
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error logging out",
        description: "There was a problem logging out of your account",
      });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-purple-600/20">
          <SettingsIcon className="w-6 h-6 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card 
          className="p-6 hover:bg-purple-900/10 transition-all cursor-pointer"
          onClick={() => navigate('/rewards')}
        >
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-semibold">Rewards & NFTs</h3>
              <p className="text-sm text-gray-400">Manage student rewards and NFT awards</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 hover:bg-purple-900/10 transition-all cursor-pointer"
          onClick={() => navigate('/attendance')}
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="font-semibold">Attendance</h3>
              <p className="text-sm text-gray-400">Track and manage student attendance</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  placeholder="Your full name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>School</Label>
                <Input 
                  placeholder="Your school" 
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input 
                  placeholder="Your subject" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <Button 
                className="w-full md:w-auto" 
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-400">Receive email updates about your activity</p>
                </div>
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Achievement Alerts</Label>
                  <p className="text-sm text-gray-400">Get notified when students earn achievements</p>
                </div>
                <Switch 
                  checked={achievementAlerts}
                  onCheckedChange={setAchievementAlerts}
                />
              </div>
              <Button 
                className="w-full md:w-auto mt-4"
                onClick={handleSaveNotificationSettings}
              >
                Save Notification Settings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-gray-400">Toggle dark mode theme</p>
                </div>
                <Switch 
                  checked={darkMode}
                  onCheckedChange={handleToggleDarkMode}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact View</Label>
                  <p className="text-sm text-gray-400">Use compact layout for lists and tables</p>
                </div>
                <Switch 
                  checked={compactView}
                  onCheckedChange={handleToggleCompactView}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button 
                className="w-full md:w-auto"
                onClick={handleUpdatePassword}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>

              <div className="pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-lg font-medium">Logout</h3>
                    <p className="text-sm text-gray-400">Sign out of your account</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings;
