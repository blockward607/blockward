
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ChartBar, Trophy, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Progress = () => {
  const [achievements, setAchievements] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [averageGrade, setAverageGrade] = useState<string>('-');
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStudentProgress() {
      try {
        setLoading(true);
        
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in to view your progress"
          });
          setLoading(false);
          return;
        }

        // Get student record
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id, points')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (studentError) {
          console.error("Error fetching student data:", studentError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load your student profile"
          });
          setLoading(false);
          return;
        }
        
        if (studentData) {
          // Set total points from student record
          setTotalPoints(studentData.points || 0);
          
          // Get achievements count
          const { data: achievementsData, error: achievementsError } = await supabase
            .from('student_achievements')
            .select('*', { count: 'exact' })
            .eq('student_id', studentData.id);
            
          if (!achievementsError) {
            setAchievements(achievementsData?.length || 0);
          }
          
          // Get average grade
          const { data: grades, error: gradesError } = await supabase
            .from('grades')
            .select('points_earned')
            .eq('student_id', studentData.id);
            
          if (!gradesError && grades && grades.length > 0) {
            const total = grades.reduce((sum, grade) => sum + (grade.points_earned || 0), 0);
            const avg = total / grades.length;
            
            // Convert numeric average to letter grade
            let letterGrade = '-';
            if (avg >= 90) letterGrade = 'A';
            else if (avg >= 80) letterGrade = 'B';
            else if (avg >= 70) letterGrade = 'C';
            else if (avg >= 60) letterGrade = 'D';
            else if (avg > 0) letterGrade = 'F';
            
            setAverageGrade(letterGrade);
          }
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load progress data"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchStudentProgress();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
          <p className="text-purple-300">Loading your progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Progress</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-600/20">
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Achievements</h3>
              <p className="text-2xl font-bold text-purple-400">{achievements}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-600/20">
              <Star className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Total Points</h3>
              <p className="text-2xl font-bold text-purple-400">{totalPoints}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-600/20">
              <ChartBar className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Average Grade</h3>
              <p className="text-2xl font-bold text-purple-400">{averageGrade}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Progress;
