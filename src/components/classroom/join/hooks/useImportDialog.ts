
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { GoogleClassroom } from "@/services/google-classroom";
import { supabase } from "@/integrations/supabase/client";

export function useImportDialog(course: GoogleClassroom, onClose: () => void) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importOptions, setImportOptions] = useState({
    createClass: true,
    importStudents: true
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load students when dialog opens - now returns empty array since Google Classroom is removed
  useEffect(() => {
    const loadStudents = async () => {
      if (studentsLoaded) return;
      
      try {
        setLoading(true);
        // Since Google Classroom is removed, return empty array
        const studentsList: any[] = [];
        setStudents(studentsList);
        setStudentsLoaded(true);
      } catch (error) {
        console.error("Error loading students:", error);
        toast({
          variant: "destructive",
          title: "Failed to load students",
          description: "Could not retrieve students"
        });
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [course.id, studentsLoaded, toast]);

  const handleImport = async () => {
    try {
      setImporting(true);
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to import classes"
        });
        return;
      }

      // Get user's teacher profile
      const { data: teacherProfile, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('id, school_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profileError || !teacherProfile) {
        toast({
          variant: "destructive",
          title: "Teacher profile not found",
          description: "Could not find your teacher profile"
        });
        return;
      }

      // Create classroom
      if (importOptions.createClass) {
        const { data: classroom, error: classroomError } = await supabase
          .from('classrooms')
          .insert([{
            name: course.name,
            description: course.description || `Imported classroom: ${course.name}`,
            teacher_id: teacherProfile.id,
            school_id: teacherProfile.school_id,
            section: course.section || null
          }])
          .select()
          .single();

        if (classroomError) {
          throw classroomError;
        }

        // Import students if option is selected
        if (importOptions.importStudents && students.length > 0) {
          toast({
            title: "Students ready to import",
            description: `${students.length} students will be invited to join the class`
          });
        }

        toast({
          title: "Import successful",
          description: "Classroom has been imported successfully"
        });

        // Navigate to the classes page
        navigate('/classes');
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "Failed to import classroom"
      });
    } finally {
      setImporting(false);
      onClose();
    }
  };

  return {
    loading,
    students,
    studentsLoaded,
    importing,
    importOptions,
    setImportOptions,
    handleImport
  };
}
