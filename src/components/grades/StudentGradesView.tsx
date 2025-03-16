
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Award, Book, FileCheck, Loader2, BarChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GradeCard } from "./GradeCard";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  points_possible: number;
}

interface Grade {
  id: string;
  assignment_id: string;
  assignment: Assignment;
  points_earned: number;
  feedback?: string;
  created_at: string;
}

export const StudentGradesView = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [gpa, setGpa] = useState<string>("-");
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get student record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (studentError) throw studentError;

      // Get grades with assignments joined
      const { data: gradesData, error: gradesError } = await supabase
        .from('grades')
        .select(`
          id,
          points_earned,
          feedback,
          created_at,
          assignment_id,
          assignment:assignments (
            id,
            title,
            description,
            due_date,
            points_possible
          )
        `)
        .eq('student_id', studentData.id)
        .order('created_at', { ascending: false });

      if (gradesError) throw gradesError;

      // Calculate totals and GPA
      let totalEarned = 0;
      let totalPossible = 0;

      gradesData?.forEach(grade => {
        if (grade.points_earned && grade.assignment?.points_possible) {
          totalEarned += Number(grade.points_earned);
          totalPossible += Number(grade.assignment.points_possible);
        }
      });

      setEarnedPoints(totalEarned);
      setTotalPoints(totalPossible);

      // Calculate letter grade
      const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
      let letterGrade = '-';
      
      if (percentage >= 90) letterGrade = 'A';
      else if (percentage >= 80) letterGrade = 'B';
      else if (percentage >= 70) letterGrade = 'C';
      else if (percentage >= 60) letterGrade = 'D';
      else if (percentage > 0) letterGrade = 'F';
      
      setGpa(letterGrade);
      setGrades(gradesData || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load grades"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 glass-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-600/20">
              <FileCheck className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Overall Grade</h3>
              <p className="text-2xl font-bold text-purple-400">{gpa}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 glass-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-600/20">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Points Earned</h3>
              <p className="text-2xl font-bold text-purple-400">{earnedPoints} / {totalPoints}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 glass-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-600/20">
              <BarChart className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Completion</h3>
              <p className="text-2xl font-bold text-purple-400">
                {totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Grades List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Assignment Grades</h2>
        
        {grades.length === 0 ? (
          <Card className="p-6 text-center bg-black/50 border-purple-500/20">
            <p className="text-gray-400">No grades available yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {grades.map((grade) => (
              <GradeCard key={grade.id} grade={grade} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
