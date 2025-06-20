
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  Database, 
  Wifi, 
  HardDrive, 
  Cpu, 
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Monitor
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  unit: string;
  icon: any;
}

export const SystemMonitoring = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, status: 'healthy', unit: '%', icon: Cpu },
    { name: 'Memory Usage', value: 67, status: 'warning', unit: '%', icon: HardDrive },
    { name: 'Database Load', value: 23, status: 'healthy', unit: '%', icon: Database },
    { name: 'Network Traffic', value: 89, status: 'critical', unit: '%', icon: Wifi },
    { name: 'Active Sessions', value: 234, status: 'healthy', unit: 'users', icon: Activity },
    { name: 'Response Time', value: 145, status: 'healthy', unit: 'ms', icon: Monitor }
  ]);

  const [systemLogs, setSystemLogs] = useState([
    { time: '10:30:45', level: 'info', message: 'User authentication successful', source: 'Auth Service' },
    { time: '10:29:12', level: 'warning', message: 'High memory usage detected', source: 'System Monitor' },
    { time: '10:28:03', level: 'error', message: 'Database connection timeout', source: 'Database' },
    { time: '10:27:21', level: 'info', message: 'Backup completed successfully', source: 'Backup Service' },
    { time: '10:26:15', level: 'warning', message: 'SSL certificate expires in 30 days', source: 'Security' }
  ]);

  const refreshMetrics = () => {
    // Simulate metric updates
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 20))
    })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return Activity;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'text-blue-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Monitoring</h2>
          <p className="text-gray-400">Real-time system performance and health monitoring</p>
        </div>
        <Button onClick={refreshMetrics} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const StatusIcon = getStatusIcon(metric.status);
          
          return (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-blue-400" />
                      <CardTitle className="text-lg text-white">{metric.name}</CardTitle>
                    </div>
                    <StatusIcon className={`w-5 h-5 ${getStatusColor(metric.status)}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">
                        {metric.value}
                        <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>
                      </span>
                      <Badge variant={
                        metric.status === 'healthy' ? 'default' :
                        metric.status === 'warning' ? 'secondary' : 'destructive'
                      }>
                        {metric.status}
                      </Badge>
                    </div>
                    {metric.unit === '%' && (
                      <Progress 
                        value={metric.value} 
                        className="h-2"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* System Logs */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="w-5 h-5" />
            System Logs
          </CardTitle>
          <CardDescription className="text-gray-400">
            Recent system events and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemLogs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg"
              >
                <div className="text-sm text-gray-500 font-mono">
                  {log.time}
                </div>
                <Badge variant="outline" className={`${getLevelColor(log.level)} border-current`}>
                  {log.level.toUpperCase()}
                </Badge>
                <div className="flex-1">
                  <div className="text-white text-sm">{log.message}</div>
                  <div className="text-gray-500 text-xs">{log.source}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Database className="w-4 h-4 mr-2" />
              Database Backup
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Server className="w-4 h-4 mr-2" />
              Restart Services
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Activity className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Monitor className="w-4 h-4 mr-2" />
              System Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
