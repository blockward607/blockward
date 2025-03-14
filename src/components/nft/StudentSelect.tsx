
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
import { User, Users, Medal, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Student {
  id: string;
  name: string;
  user_id: string;
  points: number;
}

interface StudentSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const StudentSelect = ({ value, onChange }: StudentSelectProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadStudents() {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .order("name");

        if (error) {
          throw error;
        }

        // If no students in database, use demo data
        if (!data || data.length === 0) {
          const demoStudents = [
            { id: "1", name: "Student 1", user_id: "user1", points: 750 },
            { id: "2", name: "Student 2", user_id: "user2", points: 520 },
            { id: "3", name: "Student 3", user_id: "user3", points: 890 },
            { id: "4", name: "Student 4", user_id: "user4", points: 430 },
            { id: "5", name: "Student 5", user_id: "user5", points: 670 },
          ];
          setStudents(demoStudents);
        } else {
          setStudents(data);
        }
      } catch (error) {
        console.error("Error loading students:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load students",
        });
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, [toast]);

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="text-sm text-gray-400 flex items-center gap-2">
          <Users className="w-4 h-4" /> Loading Students...
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
                  <Avatar className="h-6 w-6 border border-purple-500/20">
                    <AvatarFallback className="bg-purple-800/30 text-purple-100 text-xs">
                      {student.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{student.name}</span>
                  <div className="ml-auto flex items-center text-xs text-purple-400">
                    <Star className="w-3 h-3 mr-1" />
                    {student.points || 0}
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
