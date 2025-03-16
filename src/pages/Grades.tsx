
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FileCheck, Info, Loader2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentGradesView } from "@/components/grades/StudentGradesView";
import { TeacherGradesView } from "@/components/grades/TeacherGradesView";
import { useAuth } from "@/hooks/use-auth";

const Grades = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { isTeacher, isStudent } = useAuth();
  
  useEffect(() => {
    // Check auth on page load
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            variant: "destructive",
            title: "Authentication Required",
            description: "Please sign in to view grades"
          });
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
          <p className="text-purple-300">Loading grades information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileCheck className="h-7 w-7 text-purple-400" />
          Grades
        </h1>
        
        <Badge variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-500/30 px-3 py-1">
          {isTeacher ? "Teacher View" : "Student View"}
        </Badge>
      </div>

      {isTeacher ? (
        <TeacherGradesView />
      ) : (
        <StudentGradesView />
      )}
    </div>
  );
};

export default Grades;
