
import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserCheck, UserX, Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface AttendanceStatsProps {
  classroomId: string;
  attendanceHistory: Record<string, any>[];
  isLoading: boolean;
}

export function AttendanceStats({ 
  attendanceHistory, 
  isLoading 
}: AttendanceStatsProps) {
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    totalRecords: 0,
    presentPercentage: 0,
    absentPercentage: 0,
    latePercentage: 0
  });
  
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!attendanceHistory.length) return;
    
    // Calculate stats
    const present = attendanceHistory.filter(record => record.status === 'present').length;
    const absent = attendanceHistory.filter(record => record.status === 'absent').length;
    const late = attendanceHistory.filter(record => record.status === 'late').length;
    const total = present + absent + late;
    
    setStats({
      present,
      absent,
      late,
      totalRecords: total,
      presentPercentage: total ? Math.round((present / total) * 100) : 0,
      absentPercentage: total ? Math.round((absent / total) * 100) : 0,
      latePercentage: total ? Math.round((late / total) * 100) : 0
    });
    
    // Prepare chart data by date
    const dateGroups = attendanceHistory.reduce((groups: Record<string, any>, record) => {
      const date = record.date;
      if (!groups[date]) {
        groups[date] = { date, present: 0, absent: 0, late: 0 };
      }
      
      groups[date][record.status] += 1;
      return groups;
    }, {});
    
    const chartDataArray = Object.values(dateGroups)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10); // Get last 10 days
    
    setChartData(chartDataArray);
  }, [attendanceHistory]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-80">
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (!attendanceHistory.length) {
    return (
      <Card className="p-6 text-center">
        <p>No attendance records found. Start tracking attendance to see statistics.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Present Rate
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentPercentage}%</div>
            <Progress 
              value={stats.presentPercentage} 
              className="h-2 mt-2"
              indicatorClassName="bg-green-500" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.present} out of {stats.totalRecords} records
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Absent Rate
            </CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.absentPercentage}%</div>
            <Progress 
              value={stats.absentPercentage} 
              className="h-2 mt-2"
              indicatorClassName="bg-red-500" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.absent} out of {stats.totalRecords} records
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Late Rate
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.latePercentage}%</div>
            <Progress 
              value={stats.latePercentage} 
              className="h-2 mt-2"
              indicatorClassName="bg-yellow-500" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.late} out of {stats.totalRecords} records
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trends</CardTitle>
          <CardDescription>Last 10 days of attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 50,
                }}
              >
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  tick={{ fontSize: 12 }}
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" name="Present" fill="#22c55e" />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" />
                <Bar dataKey="late" name="Late" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
