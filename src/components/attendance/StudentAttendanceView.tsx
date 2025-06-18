
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
        // get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("User not logged in");
        // find student.id for this user
        const { data: studentProfile, error: studentError } = await supabase
          .from("students")
          .select("id")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (studentError || !studentProfile) throw new Error("Student record not found");
        // fetch this student's attendance for this class
        const { data, error } = await supabase
          .from("attendance")
          .select("id, date, status, notes")
          .eq("classroom_id", classroomId)
          .eq("student_id", studentProfile.id)
          .order("date", { ascending: false });
        if (error) throw error;
        setRecords(data || []);
      } catch (err: any) {
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
    fetchAttendance();
  }, [classroomId, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500 mb-2" />
        <span>Loading attendance...</span>
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
      <div className="mb-3 font-semibold">Your Attendance History</div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map(rec => (
              <TableRow key={rec.id}>
                <TableCell>{new Date(rec.date).toLocaleDateString()}</TableCell>
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
                <TableCell>{rec.notes || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
