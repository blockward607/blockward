
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SeatingChart } from "@/components/seating/SeatingChart";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

const ClassroomSeating = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const [selectedClassroom, setSelectedClassroom] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFirstClassroom = async () => {
      if (classroomId) {
        // If classroomId is provided in the URL, fetch that specific classroom
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('classrooms')
            .select('id, name')
            .eq('id', classroomId)
            .single();

          if (error) throw error;
          if (data) setSelectedClassroom(data);
        } catch (error) {
          console.error("Error fetching classroom:", error);
          toast.error("Failed to load classroom data");
        } finally {
          setLoading(false);
        }
      } else {
        // If no classroomId provided, fetch the first classroom for the user
        try {
          setLoading(true);
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            navigate('/auth');
            return;
          }
          
          // Check if user is a teacher
          const { data: teacherProfile } = await supabase
            .from('teacher_profiles')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (teacherProfile) {
            // Fetch first classroom where user is a teacher
            const { data: classrooms, error } = await supabase
              .from('classrooms')
              .select('id, name')
              .eq('teacher_id', teacherProfile.id)
              .order('created_at', { ascending: false })
              .limit(1);
              
            if (error) throw error;
            
            if (classrooms && classrooms.length > 0) {
              setSelectedClassroom(classrooms[0]);
            } else {
              // No classrooms found
              toast.info("No classrooms found. Create a classroom first.");
              navigate('/classes');
            }
          } else {
            // User is not a teacher
            toast.error("Only teachers can access seating plans");
            navigate('/dashboard');
          }
        } catch (error) {
          console.error("Error fetching classrooms:", error);
          toast.error("Failed to load classroom data");
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchFirstClassroom();
  }, [classroomId, navigate]);

  if (loading) {
    return (
      <div className="container px-4 py-6 flex justify-center items-center h-[60vh]">
        <Card className="p-8 text-center">
          <div className="animate-pulse">Loading classroom data...</div>
        </Card>
      </div>
    );
  }

  if (!selectedClassroom) {
    return (
      <div className="container px-4 py-6">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">No Classroom Selected</h2>
          <p className="mb-4">Please select a classroom to view its seating plan.</p>
          <Button onClick={() => navigate('/classes')}>
            Go to Classes
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 max-w-6xl">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/classes')}
          className="mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Classrooms
        </Button>
        <h1 className="text-3xl font-bold gradient-text">
          {selectedClassroom.name} - Seating Plan
        </h1>
      </div>
      
      <div className="w-full">
        <SeatingChart classroomId={selectedClassroom.id} />
      </div>
    </div>
  );
};

export default ClassroomSeating;
