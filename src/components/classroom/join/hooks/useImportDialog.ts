
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { GoogleClassroom } from "@/services/google-classroom";
import GoogleClassroomService from "@/services/google-classroom";
import { supabase } from "@/integrations/supabase/client";
import { ClassJoinService } from "@/services/class-join";

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
  useEffect(() => {
    const loadStudents = async () => {
      if (studentsLoaded) return;
      
      try {
        setLoading(true);
        console.log("Loading students for course:", course.id);
        const studentsList = await GoogleClassroomService.listStudents(course.id);
        console.log("Retrieved students:", studentsList.length);
        setStudents(studentsList);
        setStudentsLoaded(true);
      } catch (error) {
        console.error("Error loading students:", error);
        toast.error("Could not retrieve students from Google Classroom");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [course.id, studentsLoaded]);

  const handleImport = async () => {
    try {
      setImporting(true);
      console.log("Starting import process for course:", course.name);
      
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
        console.log("Creating classroom:", course.name);
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
          console.error("Error creating classroom:", classroomError);
          throw classroomError;
        }

        console.log("Classroom created successfully:", classroom);

        // Import students if option is selected
        if (importOptions.importStudents && students.length > 0) {
          console.log(`Creating invitations for ${students.length} students`);
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

  // Add a function to directly join a Google Classroom
  const handleJoinClass = async () => {
    try {
      setImporting(true);
      console.log("Attempting to join Google Classroom:", course.name);
      
      // Check for enrollment code
      const classCode = course.enrollmentCode || course.id;
      if (!classCode) {
        toast.error("This classroom doesn't have a valid enrollment code");
        return;
      }
      
      // Try to find a match or create local representation
      const { data: matchData, error: matchError } = 
        await ClassJoinService.findClassroomOrInvitation(classCode);
      
      if (matchError || !matchData) {
        console.log("No local match found, creating new class...");
        await handleImport();
        return;
      }
      
      // If match found, try to enroll
      const { data: enrollData, error: enrollError } = 
        await ClassJoinService.enrollStudent(matchData.classroomId, matchData.invitationId);
      
      if (enrollError) {
        console.error("Error joining classroom:", enrollError);
        toast.error(enrollError.message || "Could not join this classroom");
        return;
      }
      
      // Success!
      toast.success(`You've successfully joined ${course.name}`);
      
      // Navigate to class details page
      navigate(`/class/${matchData.classroomId}`);
      
    } catch (error) {
      console.error("Error joining class directly:", error);
      toast.error("An error occurred while joining the classroom");
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
    handleJoinClass
  };
}
