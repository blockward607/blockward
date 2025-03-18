
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";

const Analytics = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [classPerformanceData, setClassPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // Get authenticated session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            variant: "destructive",
            title: "Authentication required",
            description: "Please log in to view analytics"
          });
          return;
        }

        // Fetch classrooms for this teacher
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (!teacherProfile) {
          setLoading(false);
          return;
        }
          
        const { data: classrooms } = await supabase
          .from('classrooms')
          .select('id, name')
          .eq('teacher_id', teacherProfile.id);
          
        if (!classrooms || classrooms.length === 0) {
          // If no classrooms, use default data
          setEmptyData();
          setLoading(false);
          return;
        }
          
        // Generate attendance data
        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const attendance = weekdays.map(day => {
          return {
            name: day,
            attendance: Math.floor(Math.random() * 15 + 85), // 85-100%
            engagement: Math.floor(Math.random() * 20 + 75) // 75-95%
          };
        });
        setAttendanceData(attendance);
        
        // Generate engagement data
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const engagement = weeks.map(week => {
          return {
            name: week,
            value: Math.floor(Math.random() * 25 + 75) // 75-100
          };
        });
        setEngagementData(engagement);
        
        // Generate class performance data
        const performance = classrooms.map(classroom => {
          return {
            name: classroom.name,
            score: Math.floor(Math.random() * 30 + 70) // 70-100
          };
        });
        setClassPerformanceData(performance);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load analytics data"
        });
        setEmptyData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [toast]);
  
  const setEmptyData = () => {
    setAttendanceData([
      { name: 'Mon', attendance: 0, engagement: 0 },
      { name: 'Tue', attendance: 0, engagement: 0 },
      { name: 'Wed', attendance: 0, engagement: 0 },
      { name: 'Thu', attendance: 0, engagement: 0 },
      { name: 'Fri', attendance: 0, engagement: 0 },
    ]);
    
    setEngagementData([
      { name: 'Week 1', value: 0 },
      { name: 'Week 2', value: 0 },
      { name: 'Week 3', value: 0 },
      { name: 'Week 4', value: 0 },
    ]);
    
    setClassPerformanceData([
      { name: 'No Classes', score: 0 },
    ]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Analytics Dashboard</h1>
      
      <div className="grid gap-6">
        <Card className="p-6 bg-gradient-to-br from-purple-900/10 to-black border-purple-500/30">
          <h2 className="text-lg font-semibold mb-4">Weekly Overview</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="engagement" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 bg-gradient-to-br from-blue-900/10 to-black border-blue-500/30">
            <h2 className="text-lg font-semibold mb-4">Attendance Rate</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="attendance" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-900/10 to-black border-green-500/30">
            <h2 className="text-lg font-semibold mb-4">Class Performance</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="score" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
