
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Users, Medal, Star, Loader2, Trophy, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  name: string;
  user_id: string;
  points: number;
  school?: string;
}

interface StudentSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const StudentSelect = ({ value, onChange }: StudentSelectProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getColorForPoints = (points: number) => {
    if (points >= 800) return "text-amber-400";
    if (points >= 600) return "text-purple-400";
    if (points >= 400) return "text-blue-400";
    if (points >= 200) return "text-green-400";
    return "text-gray-400";
  };

  const getBadgeForPoints = (points: number) => {
    if (points >= 800) return <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30">Elite</Badge>;
    if (points >= 600) return <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">Expert</Badge>;
    if (points >= 400) return <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">Advanced</Badge>;
    if (points >= 200) return <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">Novice</Badge>;
    return null;
  };

  const getAvatarBorderColor = (points: number) => {
    if (points >= 800) return "border-amber-500";
    if (points >= 600) return "border-purple-500";
    if (points >= 400) return "border-blue-500";
    if (points >= 200) return "border-green-500";
    return "border-gray-600";
  };

  useEffect(() => {
    async function loadStudents() {
      try {
        console.log('Loading students...');
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get teacher profile
          const { data: teacherProfile } = await supabase
            .from('teacher_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (teacherProfile) {
            // Get classrooms for this teacher
            const { data: classrooms } = await supabase
              .from('classrooms')
              .select('id')
              .eq('teacher_id', teacherProfile.id);
              
            if (classrooms && classrooms.length > 0) {
              // Get students from all teacher's classrooms
              const classroomIds = classrooms.map(c => c.id);
              
              const { data: classroomStudents } = await supabase
                .from('classroom_students')
                .select('student_id')
                .in('classroom_id', classroomIds);
                
              if (classroomStudents && classroomStudents.length > 0) {
                const studentIds = classroomStudents.map(cs => cs.student_id);
                
                const { data: studentData, error } = await supabase
                  .from('students')
                  .select('*')
                  .in('id', studentIds)
                  .order('name');
                  
                if (error) {
                  console.error('Error from Supabase:', error);
                  throw error;
                }
                
                if (studentData && studentData.length > 0) {
                  console.log(`Found ${studentData.length} students in teacher's classrooms`);
                  setStudents(studentData);
                } else {
                  // Use demo data if no students found
                  useDemoStudents();
                }
              } else {
                // Use demo data if no classroom students found
                useDemoStudents();
              }
            } else {
              // Use demo data if no classrooms found
              useDemoStudents();
            }
          } else {
            // Use demo data if no teacher profile found
            useDemoStudents();
          }
        } else {
          // Use demo data if no session found
          useDemoStudents();
        }
      } catch (error) {
        console.error("Error loading students:", error);
        useDemoStudents();
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load students"
        });
      } finally {
        setLoading(false);
      }
    }

    function useDemoStudents() {
      console.log('Using demo students data');
      const demoStudents = [
        { id: "1", name: "Alex Johnson", user_id: "user1", points: 750, school: "Lincoln High" },
        { id: "2", name: "Maria Garcia", user_id: "user2", points: 520, school: "Washington Academy" },
        { id: "3", name: "James Wilson", user_id: "user3", points: 890, school: "Jefferson Middle School" },
        { id: "4", name: "Sophia Chen", user_id: "user4", points: 430, school: "Franklin Elementary" },
        { id: "5", name: "Ethan Williams", user_id: "user5", points: 670, school: "Roosevelt High" },
      ];
      setStudents(demoStudents);
    }

    loadStudents();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm text-gray-400 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading Students...
        </label>
        <Select disabled>
          <SelectTrigger className="bg-black/20 border-purple-500/20 backdrop-blur-sm">
            <SelectValue placeholder="Loading students..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <label className="text-sm text-gray-400 flex items-center gap-2">
        <Medal className="w-4 h-4 text-purple-400" /> Select Recipient for BlockWard
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="glass-input bg-black/20 border-purple-500/20 backdrop-blur-sm">
          <SelectValue placeholder="Select a student" />
        </SelectTrigger>
        <SelectContent className="bg-black/80 backdrop-blur-xl border-purple-500/20">
          {students.length === 0 ? (
            <SelectItem value="none" disabled>
              No students available
            </SelectItem>
          ) : (
            students.map((student) => (
              <SelectItem key={student.id} value={student.id} className="focus:bg-purple-500/20">
                <div className="flex items-center gap-3">
                  <Avatar className={`h-7 w-7 border ${getAvatarBorderColor(student.points || 0)}`}>
                    <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${student.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`} />
                    <AvatarFallback className="bg-purple-800/30 text-purple-100 text-xs">
                      {student.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span>{student.name}</span>
                      {student.points >= 600 && (
                        <Sparkles className="h-3 w-3 text-amber-400" />
                      )}
                    </div>
                    {student.school && (
                      <span className="text-xs text-gray-500">{student.school}</span>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <div className={`text-xs ${getColorForPoints(student.points || 0)} flex items-center`}>
                      <Star className="w-3 h-3 mr-1" />
                      {student.points || 0}
                    </div>
                    {getBadgeForPoints(student.points || 0)}
                  </div>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </motion.div>
  );
};
