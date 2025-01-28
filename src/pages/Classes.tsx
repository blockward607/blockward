import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, Calendar, Award, Plus } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { ClassroomGrid } from "@/components/classroom/ClassroomGrid";

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

  const createNewClass = async () => {
    try {
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .single();

      if (!teacherProfile) {
        throw new Error('Teacher profile not found');
      }

      const { data: newClassroom, error } = await supabase
        .from('classrooms')
        .insert([
          {
            name: `New Class ${classrooms.length + 1}`,
            description: 'A new classroom',
            teacher_id: teacherProfile.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setClassrooms([...classrooms, { ...newClassroom, students: [] }]);
      
      toast({
        title: "Success",
        description: "New classroom created successfully"
      });
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create new classroom"
      });
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
        <Button 
          onClick={createNewClass}
          className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Class
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {classrooms.map((classroom) => (
          <ClassroomGrid key={classroom.id} classroom={classroom} />
        ))}
      </div>
    </div>
  );
};

export default Classes;