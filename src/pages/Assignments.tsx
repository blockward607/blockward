
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Calendar, Clock, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  points_possible: number;
  classroom_id: string;
  created_at: string;
}

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    due_date: "",
    points_possible: 100,
    classroom_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClassroom) {
      fetchAssignments();
    }
  }, [selectedClassroom]);

  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    setUserRole(roleData?.role || null);
  };

  const fetchClassrooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (userRole === 'teacher') {
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (teacherProfile) {
          const { data: classroomsData } = await supabase
            .from('classrooms')
            .select('*')
            .eq('teacher_id', teacherProfile.id);

          setClassrooms(classroomsData || []);
          if (classroomsData && classroomsData.length > 0) {
            setSelectedClassroom(classroomsData[0].id);
          }
        }
      } else {
        // For students, fetch enrolled classrooms
        const { data: studentProfile } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (studentProfile) {
          const { data: enrolledClassrooms } = await supabase
            .from('classroom_students')
            .select('classroom:classrooms(*)')
            .eq('student_id', studentProfile.id);

          const classroomsData = enrolledClassrooms?.map(ec => ec.classroom) || [];
          setClassrooms(classroomsData);
          if (classroomsData.length > 0) {
            setSelectedClassroom(classroomsData[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classrooms"
      });
    }
  };

  const fetchAssignments = async () => {
    if (!selectedClassroom) return;
    
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('classroom_id', selectedClassroom)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load assignments"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async () => {
    if (!selectedClassroom) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert([{
          ...newAssignment,
          classroom_id: selectedClassroom
        }])
        .select()
        .single();

      if (error) throw error;

      setAssignments(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Assignment created successfully"
      });

      // Reset form
      setNewAssignment({
        title: "",
        description: "",
        due_date: "",
        points_possible: 100,
        classroom_id: "",
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create assignment"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Assignments</h1>
        {userRole === 'teacher' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Classroom
                  </label>
                  <select
                    className="w-full p-2 rounded-md border border-gray-600 bg-background"
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                  >
                    {classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  placeholder="Title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                />
                <Input
                  type="datetime-local"
                  value={newAssignment.due_date}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, due_date: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Points"
                  value={newAssignment.points_possible}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, points_possible: parseInt(e.target.value) }))}
                />
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={createAssignment}
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {classrooms.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {classrooms.map((classroom) => (
            <Button
              key={classroom.id}
              variant={selectedClassroom === classroom.id ? "default" : "outline"}
              onClick={() => setSelectedClassroom(classroom.id)}
            >
              {classroom.name}
            </Button>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="p-4 hover:bg-purple-900/10">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-600/20">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{assignment.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{assignment.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(assignment.due_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDistanceToNow(new Date(assignment.due_date), { addSuffix: true })}
                  </div>
                  <div className="text-sm text-purple-400">
                    {assignment.points_possible} points
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}

        {assignments.length === 0 && !loading && (
          <Card className="p-6">
            <div className="text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No assignments available in this classroom yet.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Assignments;
