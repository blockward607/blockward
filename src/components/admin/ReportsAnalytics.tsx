
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Download, FileText, Users, GraduationCap, School, TrendingUp, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie,  Cell, LineChart, Line } from "recharts";

interface AnalyticsData {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalAssignments: number;
  completionRate: number;
  activeUsers: number;
  recentActivity: any[];
  performanceData: any[];
  classDistribution: any[];
  monthlyTrends: any[];
}

export const ReportsAnalytics = () => {
  const { toast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [reportType, setReportType] = useState("overview");

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Get basic counts
      const [studentsRes, teachersRes, classesRes, assignmentsRes, gradesRes] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact' }),
        supabase.from('teacher_profiles').select('*', { count: 'exact' }),
        supabase.from('classrooms').select('*', { count: 'exact' }),
        supabase.from('assignments').select('*', { count: 'exact' }),
        supabase.from('grades').select('*', { count: 'exact' })
      ]);

      // Get class distribution data
      const { data: classDistData } = await supabase
        .from('classrooms')
        .select(`
          name,
          classroom_students(count)
        `);

      // Get performance data
      const { data: performanceData } = await supabase
        .from('grades')
        .select(`
          points_earned,
          assignments(title, points_possible)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Calculate analytics
      const totalStudents = studentsRes.count || 0;
      const totalTeachers = teachersRes.count || 0;
      const totalClasses = classesRes.count || 0;
      const totalAssignments = assignmentsRes.count || 0;
      const totalGrades = gradesRes.count || 0;
      
      const completionRate = totalAssignments > 0 ? Math.round((totalGrades / totalAssignments) * 100) : 0;

      // Process class distribution
      const classDistribution = classDistData?.map(cls => ({
        name: cls.name,
        students: cls.classroom_students?.length || 0
      })) || [];

      // Process performance data
      const processedPerformance = performanceData?.map(grade => ({
        assignment: grade.assignments?.title || 'Unknown',
        score: grade.points_earned || 0,
        possible: grade.assignments?.points_possible || 100,
        percentage: grade.assignments?.points_possible 
          ? Math.round((grade.points_earned / grade.assignments.points_possible) * 100)
          : 0
      })) || [];

      // Generate mock monthly trends (replace with real data)
      const monthlyTrends = [
        { month: 'Jan', students: totalStudents * 0.7, assignments: totalAssignments * 0.6 },
        { month: 'Feb', students: totalStudents * 0.8, assignments: totalAssignments * 0.7 },
        { month: 'Mar', students: totalStudents * 0.9, assignments: totalAssignments * 0.8 },
        { month: 'Apr', students: totalStudents, assignments: totalAssignments }
      ];

      setAnalyticsData({
        totalStudents,
        totalTeachers,
        totalClasses,
        totalAssignments,
        completionRate,
        activeUsers: totalStudents + totalTeachers,
        recentActivity: [],
        performanceData: processedPerformance.slice(0, 10),
        classDistribution: classDistribution.slice(0, 8),
        monthlyTrends
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load analytics data"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'csv') => {
    try {
      // Mock export functionality - replace with actual implementation
      const data = JSON.stringify(analyticsData, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `school-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `Report exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export report"
      });
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088fe', '#00ffff', '#ff00ff'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-gray-400">Comprehensive insights into your school's performance and activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="7" className="text-white">Last 7 days</SelectItem>
              <SelectItem value="30" className="text-white">Last 30 days</SelectItem>
              <SelectItem value="90" className="text-white">Last 3 months</SelectItem>
              <SelectItem value="365" className="text-white">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => exportReport('pdf')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button 
            onClick={() => exportReport('csv')}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-white">{analyticsData.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-600 to-green-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Teachers</p>
                <p className="text-3xl font-bold text-white">{analyticsData.totalTeachers}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Classes</p>
                <p className="text-3xl font-bold text-white">{analyticsData.totalClasses}</p>
              </div>
              <School className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-600 to-orange-700 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-white">{analyticsData.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Class Distribution
            </CardTitle>
            <CardDescription className="text-gray-400">
              Student enrollment by class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.classDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="students" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Assignment Performance
            </CardTitle>
            <CardDescription className="text-gray-400">
              Recent assignment scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="assignment" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px'
                  }}
                />
                <Line type="monotone" dataKey="percentage" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Monthly Trends
          </CardTitle>
          <CardDescription className="text-gray-400">
            Student and assignment trends over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analyticsData.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="#8884d8" strokeWidth={2} name="Students" />
              <Line type="monotone" dataKey="assignments" stroke="#82ca9d" strokeWidth={2} name="Assignments" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {analyticsData.activeUsers}
            </div>
            <p className="text-gray-400 text-sm">
              Total teachers and students
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {analyticsData.totalAssignments}
            </div>
            <p className="text-gray-400 text-sm">
              Total assignments created
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {analyticsData.completionRate}%
            </div>
            <p className="text-gray-400 text-sm">
              Average assignment completion
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
