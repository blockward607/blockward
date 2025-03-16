
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, Plus, Sparkles } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { ClassroomGrid } from "@/components/classroom/ClassroomGrid";
import { InviteStudents } from "@/components/classroom/InviteStudents";
import { JoinClassSection } from "@/components/classroom/JoinClassSection";
import { motion } from "framer-motion";
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
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

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
      setSelectedClassroom(newClassroomData);
      
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

  const handleDeleteClass = (classroomId: string) => {
    // Filter out the deleted classroom
    setClassrooms(classrooms.filter(classroom => classroom.id !== classroomId));
    
    // If the deleted classroom was selected, clear the selection
    if (selectedClassroom && selectedClassroom.id === classroomId) {
      setSelectedClassroom(null);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="p-4 flex items-center gap-3"
        >
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
          <span className="text-xl">Loading classes...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8"
    >
      <motion.div 
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-full bg-purple-600/30 shadow-[0_0_15px_rgba(147,51,234,0.5)] animate-pulse">
            <BookOpen className="w-8 h-8 text-purple-300" />
          </div>
          <h1 className="text-4xl font-bold shimmer-text">
            {userRole === 'teacher' ? 'My Classes' : 'Enrolled Classes'}
          </h1>
        </div>
        
        {userRole === 'teacher' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 text-lg py-6 px-4">
                <Plus className="w-5 h-5" />
                Create New Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#25293A] border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
              <DialogHeader>
                <DialogTitle className="text-xl text-center text-white">Create New Classroom</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Classroom name"
                  value={newClassroom.name}
                  onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                  className="bg-black/50 border-purple-500/30 text-white"
                />
                <Textarea
                  placeholder="Description"
                  value={newClassroom.description}
                  onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
                  className="bg-black/50 border-purple-500/30 text-white min-h-[100px]"
                />
              </div>
              <Button onClick={createNewClass} className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg">
                Create Classroom
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {userRole === 'student' && classrooms.length === 0 && (
        <motion.div variants={itemVariants}>
          <JoinClassSection />
        </motion.div>
      )}
      
      {selectedClassroom && userRole === 'teacher' && (
        <motion.div variants={itemVariants}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Invite Students to {selectedClassroom.name}</h2>
            <InviteStudents classroomId={selectedClassroom.id} />
          </div>
        </motion.div>
      )}

      <motion.div variants={containerVariants} className="grid grid-cols-1 gap-6">
        {classrooms.length === 0 ? (
          <motion.div variants={itemVariants}>
            <Card className="p-8 glass-card border border-purple-500/30 shadow-[0_5px_25px_rgba(147,51,234,0.3)]">
              <div className="text-center text-gray-300 space-y-4">
                {userRole === 'teacher' ? (
                  <>
                    <BookOpen className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
                    <p className="text-xl">No classes created yet. Create your first class to get started!</p>
                  </>
                ) : (
                  <>
                    <Users className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
                    <p className="text-xl">You're not enrolled in any classes yet.</p>
                    <p className="text-gray-400">Use the form above to join a class with an invitation code.</p>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        ) : (
          classrooms.map((classroom) => (
            <motion.div 
              key={classroom.id} 
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              onClick={() => userRole === 'teacher' && setSelectedClassroom(classroom)}
            >
              <ClassroomGrid 
                classroom={classroom} 
                onDelete={handleDeleteClass} 
              />
            </motion.div>
          ))
        )}
      </motion.div>
      
      {/* Decorative elements */}
      <div className="hidden md:block">
        <div className="hexagon absolute top-40 right-40 w-32 h-32 bg-gradient-to-r from-purple-500/10 to-pink-500/10 -z-10"></div>
        <div className="hexagon absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 -z-10"></div>
      </div>
    </motion.div>
  );
};

export default Classes;
