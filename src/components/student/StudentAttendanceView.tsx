
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { format } from "date-fns";

export const StudentAttendanceView = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get student profile
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!studentData) return;

      // Fetch attendance records
      const { data: records, error } = await supabase
        .from('attendance')
        .select(`
          *,
          classrooms (
            name,
            teacher_profiles (
              full_name
            )
          )
        `)
        .eq('student_id', studentData.id)
        .order('date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAttendanceRecords(records || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load attendance records"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Users className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'text-green-400';
      case 'absent':
        return 'text-red-400';
      case 'late':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <Card className="p-6 glass-card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">My Attendance</h3>
      </div>

      {attendanceRecords.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No attendance records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attendanceRecords.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(record.status)}
                <div>
                  <p className="font-medium text-white">
                    {record.classrooms?.name || 'Unknown Class'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {record.classrooms?.teacher_profiles?.full_name || 'Unknown Teacher'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-medium capitalize ${getStatusColor(record.status)}`}>
                  {record.status || 'Unknown'}
                </p>
                <p className="text-sm text-gray-400">
                  {format(new Date(record.date), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
