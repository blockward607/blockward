
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, UserPlus, Star, MessageSquare } from "lucide-react";
import { StudentFeedbackForm } from "@/components/teacher/StudentFeedbackForm";
import { useAuth } from "@/hooks/use-auth";

const Students = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { userRole } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let studentsData;

      if (userRole === 'teacher') {
        // Get teacher's classrooms and their students
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (!teacherProfile) return;

        const { data: classrooms } = await supabase
          .from('classrooms')
          .select('id')
          .eq('teacher_id', teacherProfile.id);

        if (!classrooms || classrooms.length === 0) {
          setStudents([]);
          return;
        }

        const classroomIds = classrooms.map(c => c.id);

        const { data: studentData, error } = await supabase
          .from('classroom_students')
          .select(`
            students (
              id,
              name,
              points,
              created_at,
              user_id
            )
          `)
          .in('classroom_id', classroomIds);

        if (error) throw error;
        
        studentsData = studentData?.map(cs => cs.students).filter(Boolean) || [];
        
        // Remove duplicates
        const uniqueStudents = studentsData.filter((student, index, self) => 
          index === self.findIndex(s => s?.id === student?.id)
        );
        
        setStudents(uniqueStudents);
      } else {
        // For admins or other roles, get all students
        const { data: studentData, error } = await supabase
          .from('students')
          .select('*')
          .order('name');

        if (error) throw error;
        setStudents(studentData || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addBehaviorPoints = async (studentId: string, points: number) => {
    try {
      const { error } = await supabase.rpc('increment_student_points', {
        student_id: studentId,
        points_to_add: points
      });

      if (error) throw error;

      toast({
        title: "Points Added!",
        description: `Added ${points} points to student`
      });

      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error adding points:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add points"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 mx-auto text-purple-400 opacity-50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
          <p className="text-gray-400">
            {searchTerm ? "No students match your search." : "No students enrolled yet."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="p-6 glass-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{student.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                        {student.points || 0} points
                      </Badge>
                      <span className="text-sm text-gray-400">
                        Joined {new Date(student.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {userRole === 'teacher' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addBehaviorPoints(student.id, 5)}
                      className="text-green-400 border-green-400/50 hover:bg-green-400/10"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      +5 Points
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addBehaviorPoints(student.id, 10)}
                      className="text-yellow-400 border-yellow-400/50 hover:bg-yellow-400/10"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      +10 Points
                    </Button>
                    <StudentFeedbackForm
                      studentId={student.id}
                      studentName={student.name}
                      onFeedbackSent={fetchStudents}
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Students;
