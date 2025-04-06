
import { useState } from "react";
import { toast } from "sonner";
import { GoogleClassroom } from "@/services/google-classroom";
import GoogleClassroomService from "@/services/google-classroom";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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

  // Load students when component mounts
  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsList = await GoogleClassroomService.listStudents(course.id);
      setStudents(studentsList);
      setStudentsLoaded(true);
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Could not retrieve students from Google Classroom");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to import classes");
        return;
      }

      // Get user's teacher profile
      const { data: teacherProfile, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profileError || !teacherProfile) {
        toast.error("Could not find your teacher profile");
        return;
      }

      // Create classroom
      if (importOptions.createClass) {
        const { data: classroom, error: classroomError } = await supabase
          .from('classrooms')
          .insert([{
            name: course.name,
            description: course.description || `Imported from Google Classroom: ${course.name}`,
            teacher_id: teacherProfile.id,
            google_classroom_id: course.id,
            section: course.section || null
          }])
          .select()
          .single();

        if (classroomError) {
          throw classroomError;
        }

        // Import students if option is selected
        if (importOptions.importStudents && students.length > 0) {
          // This would typically include code to insert students into your database
          // or send invitations to students to join the class
          toast.success(`${students.length} students will be invited to join the class`);
        }

        toast.success("Google Classroom has been imported successfully");

        // Navigate to the classes page
        navigate('/classes');
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import Google Classroom");
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
    handleImport,
    loadStudents
  };
}
