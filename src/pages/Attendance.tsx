
import { useEffect, useState } from "react";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Users, School } from "lucide-react";

const Attendance = () => {
  const [userClassrooms, setUserClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserClassrooms();
  }, []);

  const fetchUserClassrooms = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }
      
      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      const userRole = roleData?.role;
      
      if (userRole === 'teacher') {
        // For teachers, get all classrooms they teach
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (teacherProfile) {
          const { data: classrooms, error } = await supabase
            .from('classrooms')
            .select('*')
            .eq('teacher_id', teacherProfile.id);
          
          if (error) throw error;
          
          setUserClassrooms(classrooms || []);
          if (classrooms && classrooms.length > 0) {
            setSelectedClassroom(classrooms[0].id);
          }
        }
      } else {
        // For students, get classrooms they're enrolled in
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (studentData) {
          const { data: enrollments, error } = await supabase
            .from('classroom_students')
            .select(`
              classroom_id,
              classrooms (*)
            `)
            .eq('student_id', studentData.id);
          
          if (error) throw error;
          
          if (enrollments) {
            const classrooms = enrollments.map(enrollment => enrollment.classrooms);
            setUserClassrooms(classrooms as any[]);
            if (classrooms.length > 0) {
              setSelectedClassroom((classrooms[0] as any).id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classrooms"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClassroomChange = (classroomId: string) => {
    setSelectedClassroom(classroomId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserClassrooms();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Classroom list has been refreshed"
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 animate-pulse">
        <School className="h-8 w-8 text-purple-400 mr-2" />
        <p className="text-lg">Loading classrooms...</p>
      </div>
    );
  }

  if (userClassrooms.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">Attendance Tracking</h1>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-purple-500/30 hover:bg-purple-900/20"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <Card className="p-6 glass-card border-purple-500/20">
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-purple-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">No Classrooms Found</h2>
            <p className="text-muted-foreground">
              You need to be part of at least one classroom to track attendance.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold gradient-text">Attendance Tracking</h1>
        
        <div className="flex items-center gap-2">
          <Select
            value={selectedClassroom || undefined}
            onValueChange={handleClassroomChange}
          >
            <SelectTrigger className="w-[250px] border-purple-500/30 bg-purple-800/10 hover:bg-purple-800/20 hover-scale transition-all">
              <SelectValue placeholder="Select a classroom" />
            </SelectTrigger>
            <SelectContent className="border-purple-500/30 bg-background/95 backdrop-blur-sm">
              {userClassrooms.map((classroom) => (
                <SelectItem key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-purple-500/30 hover:bg-purple-900/20"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {selectedClassroom ? (
        <AttendanceTracker classroomId={selectedClassroom} />
      ) : (
        <Card className="p-6 glass-card border-purple-500/20">
          <div className="text-center py-8">
            <p>Please select a classroom to view attendance</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Attendance;
