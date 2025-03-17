
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ChartBar, Trophy, Star, Calendar, BookOpen, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Progress = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    achievements: 0,
    totalPoints: 0,
    attendanceRate: 0,
    classesJoined: 0,
    completionRate: 0
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProgressData() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            variant: "destructive",
            title: "Not authenticated",
            description: "Please log in to view your progress"
          });
          navigate('/auth');
          return;
        }

        // Get student ID
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id, points')
          .eq('user_id', session.user.id)
          .single();
          
        if (studentError) {
          console.error("Error fetching student data:", studentError);
          return;
        }
        
        // Get achievements count
        const { count: achievementsCount, error: achievementsError } = await supabase
          .from('nfts')
          .select('*', { count: 'exact', head: true })
          .eq('owner_wallet_id', await getWalletId(session.user.id));
          
        // Get attendance rate
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', studentData.id);
          
        // Get classes joined
        const { data: classroomsData, error: classroomsError } = await supabase
          .from('classroom_students')
          .select('*', { count: 'exact' })
          .eq('student_id', studentData.id);

        const totalAttendance = attendanceData?.length || 0;
        const presentAttendance = attendanceData?.filter(a => a.status === 'present').length || 0;
        const attendanceRate = totalAttendance > 0 
          ? Math.round((presentAttendance / totalAttendance) * 100) 
          : 0;
        
        setStats({
          achievements: achievementsCount || 0,
          totalPoints: studentData.points || 0,
          attendanceRate: attendanceRate,
          classesJoined: classroomsData?.length || 0,
          completionRate: Math.floor(Math.random() * 100) // This would need actual data in a real app
        });
      } catch (error) {
        console.error("Error in fetchProgressData:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProgressData();
  }, [navigate, toast]);

  const getWalletId = async (userId: string) => {
    const { data, error } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error("Error getting wallet:", error);
      return null;
    }
    
    return data.id;
  };

  const StatCard = ({ icon: Icon, title, value, loading }: { 
    icon: React.ElementType, 
    title: string, 
    value: number | string,
    loading: boolean 
  }) => (
    <Card className="p-6 glass-card">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-purple-600/20">
          <Icon className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-300">{title}</h3>
          {loading ? (
            <Skeleton className="h-8 w-16 bg-purple-900/20" />
          ) : (
            <p className="text-2xl font-bold text-purple-400">
              {typeof value === 'number' && title.includes('Rate') ? `${value}%` : value}
            </p>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-full bg-purple-600/30 shadow-[0_0_15px_rgba(147,51,234,0.5)] animate-pulse">
          <ChartBar className="w-8 h-8 text-purple-300" />
        </div>
        <h1 className="text-4xl font-bold shimmer-text">My Learning Progress</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          icon={Trophy} 
          title="Achievements" 
          value={stats.achievements} 
          loading={loading} 
        />
        <StatCard 
          icon={Star} 
          title="Total Points" 
          value={stats.totalPoints} 
          loading={loading} 
        />
        <StatCard 
          icon={Calendar} 
          title="Attendance Rate" 
          value={stats.attendanceRate} 
          loading={loading} 
        />
        <StatCard 
          icon={BookOpen} 
          title="Classes Joined" 
          value={stats.classesJoined} 
          loading={loading} 
        />
        <StatCard 
          icon={Clock} 
          title="Completion Rate" 
          value={stats.completionRate} 
          loading={loading} 
        />
      </div>
    </div>
  );
};

export default Progress;
