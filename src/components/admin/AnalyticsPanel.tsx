
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Users, 
  GraduationCap, 
  School,
  Award,
  Calendar
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalNFTs: number;
  recentSignups: number;
}

export const AnalyticsPanel = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalNFTs: 0,
    recentSignups: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get teacher count
      const { count: teacherCount } = await supabase
        .from('teacher_profiles')
        .select('*', { count: 'exact', head: true });

      // Get student count
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Get classroom count
      const { count: classCount } = await supabase
        .from('classrooms')
        .select('*', { count: 'exact', head: true });

      // Get NFT count
      const { count: nftCount } = await supabase
        .from('nfts')
        .select('*', { count: 'exact', head: true });

      // Get recent signups (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentSignupsCount } = await supabase
        .from('teacher_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      setAnalytics({
        totalUsers: (teacherCount || 0) + (studentCount || 0),
        totalTeachers: teacherCount || 0,
        totalStudents: studentCount || 0,
        totalClasses: classCount || 0,
        totalNFTs: nftCount || 0,
        recentSignups: recentSignupsCount || 0
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load analytics"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyticsCards = [
    {
      title: "Total Users",
      value: analytics.totalUsers,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Teachers",
      value: analytics.totalTeachers,
      icon: GraduationCap,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Students",
      value: analytics.totalStudents,
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Classes",
      value: analytics.totalClasses,
      icon: School,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "NFTs Created",
      value: analytics.totalNFTs,
      icon: Award,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10"
    },
    {
      title: "Recent Signups",
      value: analytics.recentSignups,
      icon: Calendar,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics Overview</h2>
        <p className="text-gray-400">School performance and usage statistics</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading analytics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyticsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-200">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${card.color}`}>
                    {card.value.toLocaleString()}
                  </div>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Active now
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
