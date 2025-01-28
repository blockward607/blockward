import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, Calendar, Award } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";

interface Classroom {
  id: string;
  name: string;
  description: string;
  teacher_id: string;
  students: {
    id: string;
    name: string;
    points: number;
  }[];
}

const Classes = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const { data: classroomsData, error: classroomsError } = await supabase
        .from('classrooms')
        .select(`
          *,
          students:classroom_students(
            student:students(*)
          )
        `);

      if (classroomsError) throw classroomsError;

      const formattedClassrooms = classroomsData.map((classroom: any) => ({
        ...classroom,
        students: classroom.students.map((s: any) => s.student)
      }));

      setClassrooms(formattedClassrooms);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classrooms"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Card className="p-6">
          <div className="flex justify-center items-center h-40">
            <p>Loading classrooms...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-purple-600/20">
            <BookOpen className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">My Classes</h1>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          Create New Class
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {classrooms.map((classroom) => (
          <Card key={classroom.id} className="p-6">
            <Tabs defaultValue="overview" className="w-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{classroom.name}</h2>
                  <p className="text-gray-400">{classroom.description}</p>
                </div>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="students">Students</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-purple-900/10">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Total Students</p>
                        <p className="text-2xl font-semibold">{classroom.students.length}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-purple-900/10">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Next Class</p>
                        <p className="text-2xl font-semibold">Today</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 bg-purple-900/10">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Average Points</p>
                        <p className="text-2xl font-semibold">
                          {Math.round(
                            classroom.students.reduce((acc, student) => acc + (student.points || 0), 0) /
                            classroom.students.length
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="attendance">
                <AttendanceTracker classroomId={classroom.id} />
              </TabsContent>

              <TabsContent value="students">
                <div className="space-y-4">
                  {classroom.students.map((student) => (
                    <Card key={student.id} className="p-4 hover:bg-purple-900/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-gray-400">{student.points} points</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Classes;