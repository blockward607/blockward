
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

        // Add demo students if they don't exist
        const demoEmails = ["arya47332js@gmail.com", "youthinkofc@gmail.com"];
        
        // Check if students with these emails exist
        for (const email of demoEmails) {
          const { data: user } = await supabase
            .from("students")
            .select("id")
            .eq("name", email.split("@")[0])
            .maybeSingle();
            
          if (!user) {
            console.log(`Demo student ${email} could be created here`);
            // We'll handle the actual creation in NFTShowcase.tsx
          }
        }

        setStudents(data || []);
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
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading students..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">Select Recipient Student</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a student" />
        </SelectTrigger>
        <SelectContent>
          {students.length === 0 ? (
            <SelectItem value="none" disabled>
              No students available
            </SelectItem>
          ) : (
            students.map((student) => (
              <SelectItem key={student.id} value={student.id}>
                {student.name} ({student.points || 0} points)
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
