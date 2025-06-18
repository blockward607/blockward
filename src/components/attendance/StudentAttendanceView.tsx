
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  notes?: string;
}

interface StudentAttendanceViewProps {
  classroomId: string;
}

export const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({ classroomId }) => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error("Authentication error");
        }
        
        if (!session) {
          throw new Error("User not logged in");
        }
        
        // Find student.id for this user
        const { data: studentProfile, error: studentError } = await supabase
          .from("students")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();
          
        if (studentError) {
          console.error('Error getting student profile:', studentError);
          throw new Error("Student record not found");
        }
        
        if (!studentProfile) {
          throw new Error("Student record not found");
        }
        
        // Fetch this student's attendance for this class
        const { data, error } = await supabase
          .from("attendance")
          .select("id, date, status, notes")
          .eq("classroom_id", classroomId)
          .eq("student_id", studentProfile.id)
          .order("date", { ascending: false });
          
        if (error) {
          console.error('Error fetching attendance:', error);
          throw error;
        }
        
        setRecords(data || []);
      } catch (err: any) {
        console.error('Attendance fetch error:', err);
        setRecords([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Failed to load attendance records.",
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (classroomId) {
      fetchAttendance();
    }
  }, [classroomId, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500 mb-2" />
        <span className="text-gray-300">Loading attendance...</span>
      </div>
    );
  }
  
  if (records.length === 0) {
    return (
      <Card className="p-4 bg-black/40 border-purple-500/20 text-center">
        <span className="text-gray-400">No attendance records yet.</span>
      </Card>
    );
  }

  return (
    <Card className="p-4 glass-card border-purple-500/20">
      <div className="mb-3 font-semibold text-white">Your Attendance History</div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-300">Date</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map(rec => (
              <TableRow key={rec.id}>
                <TableCell className="text-white">{new Date(rec.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={
                    rec.status === "present"
                      ? "text-green-500"
                      : rec.status === "late"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }>
                    {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-gray-300">{rec.notes || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
