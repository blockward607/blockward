
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Database, 
  Mail, 
  Cloud, 
  Code, 
  Palette,
  Globe,
  Shield,
  Download,
  Upload
} from "lucide-react";

export const TechnicalSettings = () => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    // Database Settings
    dbBackupInterval: '24',
    dbRetentionDays: '30',
    autoBackup: true,
    
    // Email Settings
    smtpHost: 'smtp.school.edu',
    smtpPort: '587',
    smtpUser: 'noreply@school.edu',
    emailEnabled: true,
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    cacheEnabled: true,
    
    // API Settings
    apiRateLimit: '1000',
    webhookUrl: '',
    apiLogging: true,
    
    // UI Settings
    schoolName: 'BlockWard Academy',
    primaryColor: '#8B5CF6',
    secondaryColor: '#3B82F6',
    logoUrl: '',
    
    // Security
    corsOrigins: 'https://school.edu',
    sessionDuration: '24',
    encryptionEnabled: true
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveTechnicalSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Technical settings have been updated successfully"
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `blockward-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Settings Exported",
      description: "Configuration file has been downloaded"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Technical Settings</h2>
          <p className="text-gray-400">Configure system parameters and integrations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportSettings} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <Download className="w-4 h-4 mr-2" />
            Export Config
          </Button>
          <Button onClick={saveTechnicalSettings} className="bg-green-600 hover:bg-green-700">
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Configuration */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Settings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure database backup and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Auto Backup</Label>
                <p className="text-sm text-gray-400">Enable automatic database backups</p>
              </div>
              <Switch 
                checked={settings.autoBackup}
                onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Backup Interval (hours)</Label>
              <Input
                value={settings.dbBackupInterval}
                onChange={(e) => updateSetting('dbBackupInterval', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Retention Period (days)</Label>
              <Input
                value={settings.dbRetentionDays}
                onChange={(e) => updateSetting('dbRetentionDays', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Settings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure SMTP and email notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Email Service</Label>
                <p className="text-sm text-gray-400">Enable email notifications</p>
              </div>
              <Switch 
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => updateSetting('emailEnabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">SMTP Host</Label>
              <Input
                value={settings.smtpHost}
                onChange={(e) => updateSetting('smtpHost', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Port</Label>
                <Input
                  value={settings.smtpPort}
                  onChange={(e) => updateSetting('smtpPort', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Username</Label>
                <Input
                  value={settings.smtpUser}
                  onChange={(e) => updateSetting('smtpUser', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              System Settings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Core system configuration options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Maintenance Mode</Label>
                <p className="text-sm text-gray-400">Disable public access</p>
              </div>
              <Switch 
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Debug Mode</Label>
                <p className="text-sm text-gray-400">Enable detailed error logging</p>
              </div>
              <Switch 
                checked={settings.debugMode}
                onCheckedChange={(checked) => updateSetting('debugMode', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Log Level</Label>
              <Select value={settings.logLevel} onValueChange={(value) => updateSetting('logLevel', value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Caching</Label>
                <p className="text-sm text-gray-400">Enable response caching</p>
              </div>
              <Switch 
                checked={settings.cacheEnabled}
                onCheckedChange={(checked) => updateSetting('cacheEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding Configuration */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Branding Settings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Customize school branding and appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">School Name</Label>
              <Input
                value={settings.schoolName}
                onChange={(e) => updateSetting('schoolName', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Primary Color</Label>
                <Input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="bg-gray-700 border-gray-600 h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Secondary Color</Label>
                <Input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                  className="bg-gray-700 border-gray-600 h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Logo URL</Label>
              <Input
                value={settings.logoUrl}
                onChange={(e) => updateSetting('logoUrl', e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="https://school.edu/logo.png"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API and Integration Settings */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Code className="w-5 h-5" />
            API & Integration Settings
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure external integrations and API limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">API Rate Limit (per hour)</Label>
                <Input
                  value={settings.apiRateLimit}
                  onChange={(e) => updateSetting('apiRateLimit', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">API Logging</Label>
                  <p className="text-sm text-gray-400">Log API requests</p>
                </div>
                <Switch 
                  checked={settings.apiLogging}
                  onCheckedChange={(checked) => updateSetting('apiLogging', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Webhook URL</Label>
                <Input
                  value={settings.webhookUrl}
                  onChange={(e) => updateSetting('webhookUrl', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="https://external-service.com/webhook"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">CORS Origins</Label>
                <Input
                  value={settings.corsOrigins}
                  onChange={(e) => updateSetting('corsOrigins', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Session Duration (hours)</Label>
                <Input
                  value={settings.sessionDuration}
                  onChange={(e) => updateSetting('sessionDuration', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Encryption</Label>
                  <p className="text-sm text-gray-400">Enable data encryption</p>
                </div>
                <Switch 
                  checked={settings.encryptionEnabled}
                  onCheckedChange={(checked) => updateSetting('encryptionEnabled', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
