
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  AlertTriangle, 
  UserX, 
  Clock,
  Globe,
  Settings
} from "lucide-react";

interface SecurityEvent {
  id: string;
  timestamp: string;
  event_type: string;
  user_email: string;
  ip_address: string;
  status: 'success' | 'failed' | 'blocked';
  details: string;
}

export const SecurityControls = () => {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: false,
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    ipWhitelistEnabled: false,
    auditLogEnabled: true
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      timestamp: '2024-01-15 10:30:45',
      event_type: 'login_failed',
      user_email: 'john.doe@school.edu',
      ip_address: '192.168.1.100',
      status: 'failed',
      details: 'Invalid password attempt'
    },
    {
      id: '2', 
      timestamp: '2024-01-15 10:25:12',
      event_type: 'login_success',
      user_email: 'admin@school.edu',
      ip_address: '192.168.1.50',
      status: 'success',
      details: 'Admin login successful'
    },
    {
      id: '3',
      timestamp: '2024-01-15 10:20:33',
      event_type: 'password_reset',
      user_email: 'teacher@school.edu',
      ip_address: '192.168.1.75',
      status: 'success',
      details: 'Password reset requested'
    },
    {
      id: '4',
      timestamp: '2024-01-15 10:15:21',
      event_type: 'suspicious_activity',
      user_email: 'unknown@external.com',
      ip_address: '203.0.113.5',
      status: 'blocked',
      details: 'Multiple failed login attempts'
    }
  ]);

  const updateSecuritySetting = (key: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login_success': return <Eye className="w-4 h-4 text-green-400" />;
      case 'login_failed': return <UserX className="w-4 h-4 text-red-400" />;
      case 'password_reset': return <Key className="w-4 h-4 text-blue-400" />;
      case 'suspicious_activity': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-600">Success</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'blocked': return <Badge className="bg-yellow-600">Blocked</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Security Controls</h2>
          <p className="text-gray-400">Manage system security settings and monitor threats</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Shield className="w-4 h-4 mr-2" />
          Emergency Lock
        </Button>
      </div>

      {/* Security Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Authentication Settings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure login and authentication requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-400">Require 2FA for all admin accounts</p>
              </div>
              <Switch 
                checked={securitySettings.twoFactorRequired}
                onCheckedChange={(checked) => updateSecuritySetting('twoFactorRequired', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Minimum Password Length</Label>
              <Input
                type="number"
                value={securitySettings.passwordMinLength}
                onChange={(e) => updateSecuritySetting('passwordMinLength', parseInt(e.target.value))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Session Timeout (minutes)</Label>
              <Input
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => updateSecuritySetting('sessionTimeout', parseInt(e.target.value))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Max Login Attempts</Label>
              <Input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => updateSecuritySetting('maxLoginAttempts', parseInt(e.target.value))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Access Controls
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage IP restrictions and access policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">IP Whitelist</Label>
                <p className="text-sm text-gray-400">Restrict access to approved IPs only</p>
              </div>
              <Switch 
                checked={securitySettings.ipWhitelistEnabled}
                onCheckedChange={(checked) => updateSecuritySetting('ipWhitelistEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Audit Logging</Label>
                <p className="text-sm text-gray-400">Log all security events</p>
              </div>
              <Switch 
                checked={securitySettings.auditLogEnabled}
                onCheckedChange={(checked) => updateSecuritySetting('auditLogEnabled', checked)}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-white">Quick Actions</Label>
              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-start">
                  <Lock className="w-4 h-4 mr-2" />
                  Lock All Sessions
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-start">
                  <Key className="w-4 h-4 mr-2" />
                  Force Password Reset
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Security Scan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events Log */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Security Events
          </CardTitle>
          <CardDescription className="text-gray-400">
            Recent security events and authentication attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">Event</TableHead>
                <TableHead className="text-gray-300">User</TableHead>
                <TableHead className="text-gray-300">IP Address</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Time</TableHead>
                <TableHead className="text-gray-300">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {securityEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEventIcon(event.event_type)}
                      <span className="text-white capitalize">
                        {event.event_type.replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{event.user_email}</TableCell>
                  <TableCell className="text-gray-300 font-mono">{event.ip_address}</TableCell>
                  <TableCell>{getStatusBadge(event.status)}</TableCell>
                  <TableCell className="text-gray-300">{event.timestamp}</TableCell>
                  <TableCell className="text-gray-400">{event.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
