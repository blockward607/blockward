
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Sparkles, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Student {
  id: string;
  name: string;
  points: number;
  created_at: string;
  school?: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentSchool, setNewStudentSchool] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name');

      if (error) throw error;
      setStudents(data || []);
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

  const addNewStudent = async () => {
    if (!newStudentName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a student name"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .insert([
          { 
            name: newStudentName.trim(),
            school: newStudentSchool.trim() || undefined,
            points: 0
          }
        ])
        .select();

      if (error) throw error;
      
      setStudents([...(data || []), ...students]);
      setNewStudentName("");
      setNewStudentSchool("");
      
      toast({
        title: "Success",
        description: "Student added successfully"
      });
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add student"
      });
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
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
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
          <span className="text-xl">Loading students...</span>
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
            <Users className="w-8 h-8 text-purple-300" />
          </div>
          <h1 className="text-4xl font-bold shimmer-text">Students</h1>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2 text-lg py-6 px-4">
              <PlusCircle className="w-5 h-5" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#25293A] border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
            <DialogHeader>
              <DialogTitle className="text-xl text-center text-white">Add New Student</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Student name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="bg-black/50 border-purple-500/30 text-white"
              />
              <Input
                placeholder="School (optional)"
                value={newStudentSchool}
                onChange={(e) => setNewStudentSchool(e.target.value)}
                className="bg-black/50 border-purple-500/30 text-white"
              />
            </div>
            <Button onClick={addNewStudent} className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg">
              Add Student
            </Button>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {students.length === 0 ? (
          <motion.div variants={itemVariants} className="col-span-full">
            <Card className="p-8 glass-card border border-purple-500/30 shadow-[0_5px_25px_rgba(147,51,234,0.3)]">
              <div className="text-center text-gray-300 space-y-4">
                <Users className="w-16 h-16 mx-auto text-purple-400 opacity-50" />
                <p className="text-xl">No students added yet</p>
                <p className="text-gray-400">Add students using the button above</p>
              </div>
            </Card>
          </motion.div>
        ) : (
          students.map((student) => (
            <motion.div
              key={student.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: "0 10px 30px -15px rgba(155, 135, 245, 0.6)" 
              }}
            >
              <Card className="p-6 glass-card border border-purple-500/30 shadow-[0_5px_15px_rgba(147,51,234,0.3)] h-full">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600/40 to-pink-600/40 flex items-center justify-center text-white text-lg font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-semibold text-white">{student.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300">
                          {student.school || "No school"}
                        </span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-300 text-sm font-semibold border border-purple-500/30">
                        {student.points} points
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
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

export default Students;
