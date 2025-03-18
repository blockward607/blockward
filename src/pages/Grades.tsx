
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentData } from "@/components/student-dashboard/hooks/useStudentData";
import { supabase } from "@/integrations/supabase/client";
import { useGrades } from "@/hooks/use-grades";
import { StudentGradeList } from "@/components/grades/StudentGradeList";
import { TeacherGradePanel } from "@/components/grades/TeacherGradePanel";
import { Loader2, GraduationCap } from "lucide-react";

const Grades = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { studentData } = useStudentData();
  const { studentGrades, loadingGrades } = useGrades(
    studentData?.id,
    classroomId
  );

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) throw error;
        setUserRole(roles?.role || null);
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 rounded-full bg-purple-600/20">
          <GraduationCap className="w-6 h-6 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold">Grades & Assignments</h1>
      </div>

      {userRole === "teacher" ? (
        <TeacherGradePanel classroomId={classroomId || ""} />
      ) : (
        <div className="space-y-6">
          <Card className="p-6 bg-black/40 border-purple-500/30">
            <h2 className="text-2xl font-bold mb-4">My Grades</h2>
            <StudentGradeList grades={studentGrades} loading={loadingGrades} />
          </Card>
        </div>
      )}
    </div>
  );
};

export default Grades;
