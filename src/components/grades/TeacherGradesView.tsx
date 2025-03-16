
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Award, 
  FileCheck, 
  Loader2, 
  Plus, 
  Search, 
  Users,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AssignGradeForm } from "./AssignGradeForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

interface Student {
  id: string;
  name: string;
  user_id: string;
}

interface ClassroomOption {
  id: string;
  name: string;
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  points_possible: number;
  classroom_id: string;
}

export const TeacherGradesView = () => {
  const [showForm, setShowForm] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomOption[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchTeacherClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClassroom) {
      fetchStudentsByClassroom(selectedClassroom);
      fetchAssignmentsByClassroom(selectedClassroom);
    }
  }, [selectedClassroom]);

  const fetchTeacherClassrooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('classrooms')
        .select('id, name')
        .eq('teacher_id', session.user.id);

      if (error) throw error;
      
      setClassrooms(data || []);
      if (data && data.length > 0) {
        setSelectedClassroom(data[0].id);
      }
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

  const fetchStudentsByClassroom = async (classroomId: string) => {
    try {
      const { data, error } = await supabase
        .from('classroom_students')
        .select(`
          student_id,
          student:students (
            id,
            name,
            user_id
          )
        `)
        .eq('classroom_id', classroomId);

      if (error) throw error;

      const studentsList = data?.map(item => item.student) || [];
      setStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students"
      });
    }
  };

  const fetchAssignmentsByClassroom = async (classroomId: string) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('id, title, description, points_possible, classroom_id')
        .eq('classroom_id', classroomId);

      if (error) throw error;
      
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load assignments"
      });
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    // Reset selections when closing form
    if (showForm) {
      setSelectedStudent("");
      setSelectedAssignment("");
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (classrooms.length === 0) {
    return (
      <Card className="p-6 text-center space-y-4">
        <FileCheck className="h-12 w-12 text-purple-400 mx-auto" />
        <h3 className="text-xl font-semibold">No Classes Available</h3>
        <p className="text-gray-400">You need to create a class before you can assign grades</p>
        <Button 
          onClick={() => navigate('/classes')} 
          className="bg-purple-600 hover:bg-purple-700"
        >
          Create a Class
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="p-6 glass-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-purple-600/20">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Classroom</h3>
              <Select 
                value={selectedClassroom} 
                onValueChange={setSelectedClassroom}
              >
                <SelectTrigger className="bg-black/60 border-purple-500/30 w-[200px]">
                  <SelectValue placeholder="Select classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map(classroom => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-black/60 border-purple-500/30 w-full"
              />
            </div>
            
            <Button 
              onClick={toggleForm}
              className={`rounded-full ${showForm ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}`}
              size="icon"
            >
              {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </Card>

      {/* Assign Grade Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <AssignGradeForm 
              students={students}
              assignments={assignments}
              onClose={toggleForm}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
              selectedAssignment={selectedAssignment}
              setSelectedAssignment={setSelectedAssignment}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Students List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Students</h2>
        
        {filteredStudents.length === 0 ? (
          <Card className="p-6 text-center bg-black/50 border-purple-500/20">
            <p className="text-gray-400">
              {searchTerm ? "No students match your search" : "No students in this class"}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <Card 
                key={student.id} 
                className="p-4 glass-card hover:bg-purple-900/10 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedStudent(student.id);
                  setShowForm(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-600/20">
                      <Award className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="font-medium">{student.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-purple-600/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(student.id);
                      setShowForm(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
