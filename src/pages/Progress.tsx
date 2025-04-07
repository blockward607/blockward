
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ChartBar, Trophy, Star, Loader2 } from "lucide-react";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

const ProgressPage = () => {
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [stats, setStats] = useState({
    achievements: 0,
    points: 0,
    averageGrade: 'N/A'
  });

  // Check if there's any progress data available
  useEffect(() => {
    const checkForData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        // Check if student profile exists
        const { data: studentData } = await supabase
          .from("students")
          .select("id, points")
          .eq("user_id", session.user.id)
          .single();

        if (studentData) {
          // If we have points data, show it
          if (studentData.points) {
            setStats(prev => ({ ...prev, points: studentData.points || 0 }));
          }

          // Check for achievements
          const { data: achievements, error: achError } = await supabase
            .from("student_achievements")
            .select("id")
            .eq("student_id", studentData.id);

          if (achievements && achievements.length > 0) {
            setStats(prev => ({ ...prev, achievements: achievements.length }));
            setHasData(true);
          }

          // Check for grades
          const { data: grades } = await supabase
            .from("grades")
            .select("points_earned")
            .eq("student_id", studentData.id);

          if (grades && grades.length > 0) {
            // Calculate average grade if there are any grades
            const totalPoints = grades.reduce((sum, grade) => 
              sum + (Number(grade.points_earned) || 0), 0);
            const averagePoints = totalPoints / grades.length;
            
            // Convert to letter grade
            let letterGrade = 'N/A';
            if (averagePoints >= 90) letterGrade = 'A';
            else if (averagePoints >= 80) letterGrade = 'B';
            else if (averagePoints >= 70) letterGrade = 'C';
            else if (averagePoints >= 60) letterGrade = 'D';
            else if (averagePoints > 0) letterGrade = 'F';
            
            setStats(prev => ({ ...prev, averageGrade: letterGrade }));
            setHasData(true);
          }
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setLoading(false);
      }
    };

    checkForData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Empty state - show blank page as requested
  if (!hasData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Progress</h1>
        <Card className="p-8 text-center">
          <p className="text-gray-400">No progress data available yet.</p>
          <p className="text-gray-500 text-sm mt-2">
            Your teacher will assign tasks and provide feedback.
          </p>
        </Card>
      </div>
    );
  }

  // Data available state
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
              <p className="text-2xl font-bold text-purple-400">{stats.achievements}</p>
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
              <p className="text-2xl font-bold text-purple-400">{stats.points}</p>
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
              <p className="text-2xl font-bold text-purple-400">{stats.averageGrade}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;
