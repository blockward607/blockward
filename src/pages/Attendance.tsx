import { useEffect, useState } from "react";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const Attendance = () => {
  const [classroomId, setClassroomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassroom = async () => {
      const { data: classroom } = await supabase
        .from('classrooms')
        .select('id')
        .limit(1)
        .single();
      
      if (classroom) {
        setClassroomId(classroom.id);
      }
      setLoading(false);
    };

    fetchClassroom();
  }, []);

  if (loading) {
    return <div>Loading classroom...</div>;
  }

  if (!classroomId) {
    return <div>No classroom found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Attendance Tracking</h1>
      </div>
      <AttendanceTracker classroomId={classroomId} />
    </div>
  );
};

export default Attendance;