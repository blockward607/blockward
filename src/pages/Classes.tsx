
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, Plus } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { ClassroomGrid } from "@/components/classroom/ClassroomGrid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

const Classes = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();
  const [newClassroom, setNewClassroom] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    checkUserRoleAndFetchData();
  }, []);

  const checkUserRoleAndFetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "Please log in to view classes"
        });
        return;
      }

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      setUserRole(roleData?.role || null);

      if (roleData?.role === 'teacher') {
        // Fetch teacher's classrooms
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (teacherProfile) {
          const { data: classroomsData, error } = await supabase
            .from('classrooms')
            .select('*')
            .eq('teacher_id', teacherProfile.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setClassrooms(classroomsData || []);
        }
      } else {
        // Fetch student's enrolled classrooms
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (studentData) {
          const { data: enrolledClassrooms, error } = await supabase
            .from('classroom_students')
            .select('classroom:classrooms(*)')
            .eq('student_id', studentData.id);

          if (error) throw error;
          setClassrooms(enrolledClassrooms?.map(ec => ec.classroom) || []);
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classes"
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

      const { data: newClassroomData, error } = await supabase
        .from('classrooms')
        .insert([
          {
            name: newClassroom.name,
            description: newClassroom.description,
            teacher_id: teacherProfile.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setClassrooms([newClassroomData, ...classrooms]);
      setNewClassroom({ name: "", description: "" });
      
      toast({
        title: "Success",
        description: "New classroom created successfully"
      });
    } catch (error: any) {
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
            <p>Loading classes...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-purple-600/20">
            <BookOpen className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">
            {userRole === 'teacher' ? 'My Classes' : 'Enrolled Classes'}
          </h1>
        </div>
        
        {userRole === 'teacher' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create New Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Classroom</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Classroom name"
                  value={newClassroom.name}
                  onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={newClassroom.description}
                  onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
                />
              </div>
              <Button onClick={createNewClass} className="w-full bg-purple-600 hover:bg-purple-700">
                Create Classroom
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {classrooms.length === 0 ? (
          <Card className="p-6">
            <div className="text-center text-gray-400">
              {userRole === 'teacher' 
                ? "No classes created yet. Create your first class to get started!"
                : "You're not enrolled in any classes yet."}
            </div>
          </Card>
        ) : (
          classrooms.map((classroom) => (
            <ClassroomGrid key={classroom.id} classroom={classroom} />
          ))
        )}
      </div>
    </div>
  );
};

export default Classes;
