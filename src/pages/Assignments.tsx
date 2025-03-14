
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
import { FileText, Calendar, Clock, ChevronRight, PlusCircle, Book, Award, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  points_possible: number;
  classroom_id: string;
  created_at: string;
}

interface Student {
  id: string;
  name: string;
  points: number;
}

const demoStudents: Student[] = [
  { id: "1", name: "Student 1", points: 750 },
  { id: "2", name: "Student 2", points: 520 },
  { id: "3", name: "Student 3", points: 890 },
  { id: "4", name: "Student 4", points: 430 },
  { id: "5", name: "Student 5", points: 670 },
];

const assignmentTypes = [
  { value: "quiz", label: "Quiz", icon: Book, color: "from-blue-500 to-cyan-400" },
  { value: "project", label: "Project", icon: Sparkles, color: "from-purple-500 to-pink-400" },
  { value: "homework", label: "Homework", icon: FileText, color: "from-green-500 to-emerald-400" },
  { value: "exam", label: "Exam", icon: Award, color: "from-red-500 to-orange-400" },
];

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("quiz");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    due_date: "",
    points_possible: 100,
    classroom_id: "",
    type: "quiz"
  });
  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
    fetchClassrooms();
    setTimeout(() => setLoading(false), 1000);
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

    setUserRole(roleData?.role || 'teacher');
  };

  const fetchClassrooms = async () => {
    try {
      // If no classrooms in database, use demo data
      setClassrooms([
        { id: "1", name: "Mathematics 101" },
        { id: "2", name: "Computer Science" },
        { id: "3", name: "Physics Advanced" },
      ]);
      setSelectedClassroom("1");
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
    setLoading(true);
    
    try {
      // For demo, use static assignments
      const demoAssignments = [
        {
          id: "1",
          title: "Algebra Quiz",
          description: "Test your knowledge of algebraic expressions and equations",
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          points_possible: 50,
          classroom_id: "1",
          created_at: new Date().toISOString(),
          type: "quiz"
        },
        {
          id: "2",
          title: "Geometry Project",
          description: "Create a 3D model demonstrating geometric principles",
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          points_possible: 150,
          classroom_id: "1",
          created_at: new Date().toISOString(),
          type: "project"
        },
        {
          id: "3",
          title: "Calculus Homework",
          description: "Complete problems 1-10 in chapter 3",
          due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          points_possible: 30,
          classroom_id: "1",
          created_at: new Date().toISOString(),
          type: "homework"
        }
      ];
      
      setAssignments(demoAssignments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load assignments"
      });
      setLoading(false);
    }
  };

  const createAssignment = async () => {
    if (!selectedClassroom) return;

    try {
      const newId = (assignments.length + 1).toString();
      const newAssignmentItem = {
        ...newAssignment,
        id: newId,
        classroom_id: selectedClassroom,
        created_at: new Date().toISOString(),
        type: selectedType
      };

      setAssignments(prev => [...prev, newAssignmentItem]);
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
        type: "quiz"
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

  const assignToStudent = (assignmentId: string, studentId: string) => {
    toast({
      title: "Assignment Assigned",
      description: `Assignment successfully assigned to student`
    });
    setSelectedStudent(null);
  };

  const getTypeInfo = (type: string) => {
    return assignmentTypes.find(t => t.value === type) || assignmentTypes[0];
  };

  return (
    <div className="space-y-6 py-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-blue-600/10 rounded-3xl blur-3xl" />
        <div className="relative flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm"
            >
              <FileText className="w-8 h-8 text-purple-400" />
            </motion.div>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-3xl font-bold gradient-text bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
                BlockWard Assignments
              </h1>
              <p className="text-gray-400 mt-1">Create, track and award points for academic work</p>
            </motion.div>
          </div>
          {userRole === 'teacher' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px] glass-card bg-black/80 border border-purple-500/20 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold gradient-text bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
                    Create New BlockWard Assignment
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      Assignment Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {assignmentTypes.map((type) => (
                        <button
                          key={type.value}
                          className={`p-3 flex flex-col items-center justify-center rounded-lg border transition-all ${
                            selectedType === type.value 
                              ? `bg-gradient-to-b ${type.color} border-transparent` 
                              : 'bg-black/30 border-gray-700 hover:bg-black/50'
                          }`}
                          onClick={() => setSelectedType(type.value)}
                        >
                          <type.icon className={`w-5 h-5 mb-1 ${selectedType === type.value ? 'text-white' : 'text-gray-400'}`} />
                          <span className={`text-xs ${selectedType === type.value ? 'text-white' : 'text-gray-400'}`}>
                            {type.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">
                      Select Classroom
                    </label>
                    <select
                      className="w-full p-2 rounded-md border bg-black/50 border-gray-700 text-gray-200"
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
                    placeholder="Assignment Title"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-black/50 border-gray-700 text-gray-200"
                  />
                  <Textarea
                    placeholder="Assignment Description"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-black/50 border-gray-700 text-gray-200 min-h-24"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">
                        Due Date
                      </label>
                      <Input
                        type="datetime-local"
                        value={newAssignment.due_date}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, due_date: e.target.value }))}
                        className="bg-black/50 border-gray-700 text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">
                        Points Value
                      </label>
                      <Input
                        type="number"
                        placeholder="Points"
                        value={newAssignment.points_possible}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, points_possible: parseInt(e.target.value) }))}
                        className="bg-black/50 border-gray-700 text-gray-200"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={createAssignment}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create BlockWard Assignment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {classrooms.length > 0 && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          {classrooms.map((classroom) => (
            <Button
              key={classroom.id}
              variant={selectedClassroom === classroom.id ? "default" : "outline"}
              className={selectedClassroom === classroom.id 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-none" 
                : "border-purple-500/20 hover:bg-purple-500/10"}
              onClick={() => setSelectedClassroom(classroom.id)}
            >
              {classroom.name}
            </Button>
          ))}
        </motion.div>
      )}

      <div className="grid gap-4">
        {assignments.map((assignment, index) => {
          const typeInfo = getTypeInfo(assignment.type || 'quiz');
          
          return (
            <motion.div
              key={assignment.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Card className="p-4 hover:bg-purple-900/10 border border-purple-500/20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${typeInfo.color}`}>
                    <typeInfo.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{assignment.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{assignment.description}</p>
                      </div>
                      
                      {userRole === 'teacher' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                              Assign to Student
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] glass-card bg-black/80 border border-purple-500/20 backdrop-blur-xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold gradient-text bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
                                Assign to Student
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <p className="text-sm text-gray-300">Select a student to assign <span className="font-semibold">{assignment.title}</span>:</p>
                              <div className="grid gap-2 max-h-60 overflow-y-auto pr-2">
                                {demoStudents.map(student => (
                                  <button
                                    key={student.id}
                                    className={`flex items-center gap-3 p-2 rounded-lg border text-left transition-all ${
                                      selectedStudent === student.id ? 'bg-purple-500/20 border-purple-500/50' : 'bg-black/30 border-gray-700 hover:bg-black/50'
                                    }`}
                                    onClick={() => setSelectedStudent(student.id)}
                                  >
                                    <Avatar className="border-2 border-purple-500/20">
                                      <AvatarFallback className="bg-purple-800/30 text-purple-100">
                                        {student.name.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{student.name}</div>
                                      <div className="text-xs text-purple-400">{student.points} points</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                              <Button 
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                onClick={() => assignToStudent(assignment.id, selectedStudent || '')}
                                disabled={!selectedStudent}
                              >
                                Assign Assignment
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(assignment.due_date), { addSuffix: true })}
                      </div>
                      <div className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
                        {assignment.points_possible} points
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )
        })}

        {assignments.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6 border border-purple-500/20 backdrop-blur-sm">
              <div className="text-center text-gray-400">
                <div className="p-4 rounded-full bg-purple-900/20 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-purple-400 opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Assignments Yet</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  There are no assignments available in this classroom yet. Create your first assignment to get started.
                </p>
                {userRole === 'teacher' && (
                  <Button 
                    className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => document.querySelector<HTMLButtonElement>('button:has(.lucide-plus-circle)')?.click()}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Assignment
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
        
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-4 border border-purple-500/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/20 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-purple-600/20 rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-purple-600/10 rounded animate-pulse w-2/3" />
                    <div className="flex gap-4 pt-1">
                      <div className="h-3 bg-purple-600/10 rounded animate-pulse w-24" />
                      <div className="h-3 bg-purple-600/10 rounded animate-pulse w-24" />
                      <div className="h-3 bg-purple-600/10 rounded animate-pulse w-16" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
