
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InviteStudents } from "@/components/classroom/InviteStudents";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { StudentCountIndicator } from "@/components/classroom/StudentCountIndicator";
import { useClassroomData } from "@/components/classroom/useClassroomData";

const ClassDetails = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { userRole, studentCount } = useClassroomData(classroomId || "");
  
  useEffect(() => {
    if (!classroomId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Classroom ID is missing"
      });
      navigate("/classes");
      return;
    }
    
    fetchClassroomDetails();
  }, [classroomId]);
  
  const fetchClassroomDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("classrooms")
        .select("*")
        .eq("id", classroomId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setClassroom(data);
      } else {
        toast({
          variant: "destructive",
          title: "Not Found",
          description: "Classroom not found"
        });
        navigate("/classes");
      }
    } catch (error) {
      console.error("Error fetching classroom:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classroom details"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!classroom) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] to-black p-6">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.2),transparent_40%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(192,38,211,0.2),transparent_40%)]"></div>
      </div>
      
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/classes")}
            className="mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Classes
          </Button>
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white"
          >
            {classroom.name}
          </motion.h1>
          
          {classroom.description && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gray-300 mt-2"
            >
              {classroom.description}
            </motion.p>
          )}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="p-6 glass-card">
            <h2 className="text-xl font-semibold mb-4">Student Count</h2>
            <StudentCountIndicator count={studentCount} />
          </Card>
          
          <Card className="p-6 glass-card">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {userRole === "teacher" && (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/classroom/${classroomId}/seating`)}
                  >
                    Seating Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/students?classroomId=${classroomId}`)}
                  >
                    View Students
                  </Button>
                </>
              )}
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/attendance?classroomId=${classroomId}`)}
              >
                Attendance
              </Button>
            </div>
          </Card>
          
          <Card className="p-6 glass-card">
            <h2 className="text-xl font-semibold mb-4">Class Code</h2>
            <div className="bg-purple-900/30 p-3 rounded-md text-center">
              <span className="text-2xl font-mono font-semibold text-purple-300">
                {classroomId.substring(0, 6)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Students can use this code to join your class
            </p>
          </Card>
        </motion.div>
        
        {userRole === "teacher" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="p-6 glass-card">
              <h2 className="text-xl font-semibold mb-4">Invite Students</h2>
              <InviteStudents classroomId={classroomId} />
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClassDetails;
