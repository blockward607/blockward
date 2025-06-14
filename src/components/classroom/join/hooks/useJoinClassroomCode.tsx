
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define the expected response type from the database function
interface JoinClassroomResponse {
  success: boolean;
  error?: string;
  classroom_id?: string;
  classroom_name?: string;
}

export const useJoinClassroomCode = () => {
  const [classroomCode, setClassroomCode] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoJoinInProgress, setAutoJoinInProgress] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const autoExtractCode = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const codeFromUrl = urlParams.get('code');
        
        if (codeFromUrl) {
          console.log("[useJoinClassroomCode] Found code in URL:", codeFromUrl);
          setClassroomCode(codeFromUrl);
          
          if (user) {
            console.log("[useJoinClassroomCode] User is logged in, attempting auto-join with code:", codeFromUrl);
            setAutoJoinInProgress(true);
            joinClassWithCode(codeFromUrl)
              .finally(() => setAutoJoinInProgress(false));
          }
        }
      } catch (err) {
        console.error("[useJoinClassroomCode] Error auto-extracting code:", err);
      }
    };

    autoExtractCode();
  }, [user]);

  // Helper function to ensure student profile exists
  const ensureStudentProfile = async (session: any): Promise<string | null> => {
    try {
      // Check if student profile exists
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
          
      console.log("[useJoinClassroomCode] Student profile check result:", { student, studentError });

      if (student?.id) {
        return student.id;
      }

      // Create student profile if it doesn't exist
      console.log("[useJoinClassroomCode] Creating student profile for user:", session.user.id);
      
      const { data: newStudent, error: createError } = await supabase
        .from('students')
        .insert({
          user_id: session.user.id,
          name: session.user.email?.split('@')[0] || 'Student'
        })
        .select('id')
        .single();

      if (createError) {
        console.error("[useJoinClassroomCode] Error creating student profile:", createError);
        return null;
      }
      
      console.log("[useJoinClassroomCode] Student profile created:", newStudent);

      // Set user role as student
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: session.user.id,
          role: 'student'
        });

      if (roleError) {
        console.error("[useJoinClassroomCode] Error setting user role:", roleError);
      }

      return newStudent.id;
    } catch (error) {
      console.error("[useJoinClassroomCode] Error in ensureStudentProfile:", error);
      return null;
    }
  };

  const joinClassWithCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    setIsJoining(true);
    
    try {
      console.log("[useJoinClassroomCode] Joining class with code:", code);
      
      if (!user) {
        setError("Please log in to join a class");
        console.log("[useJoinClassroomCode] No user, redirecting to auth");
        localStorage.setItem('pendingJoinCode', code);
        navigate('/auth', { state: { joinCode: code } });
        return;
      }

      if (!code.trim()) {
        setError("Please enter a classroom code");
        return;
      }
      
      // Normalize the code - remove spaces and convert to uppercase
      const normalizedCode = code.trim().toUpperCase();
      console.log("[useJoinClassroomCode] Processing join with normalized code:", normalizedCode);
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to join a class");
        navigate('/auth', { state: { joinCode: code } });
        return;
      }

      // Ensure student profile exists
      const studentId = await ensureStudentProfile(session);
      if (!studentId) {
        setError("Error preparing your student profile. Please try again.");
        return;
      }

      // Use the database function to join the classroom
      console.log("[useJoinClassroomCode] Calling join function with code:", normalizedCode, "and student ID:", studentId);
      
      const { data: result, error: joinError } = await supabase.rpc('join_classroom_with_code', {
        p_code: normalizedCode,
        p_student_id: studentId
      });
      
      if (joinError) {
        console.error("[useJoinClassroomCode] Error calling join function:", joinError);
        setError("Error joining classroom: " + joinError.message);
        return;
      }
      
      console.log("[useJoinClassroomCode] Join function result:", result);
      
      // Safely handle the JSON response by converting to unknown first
      const response = result as unknown as JoinClassroomResponse;
      
      if (!response.success) {
        setError(response.error || "Failed to join classroom");
        return;
      }
      
      console.log("[useJoinClassroomCode] Successfully joined classroom:", response.classroom_name);
      toast.success(`You've joined ${response.classroom_name}`);
      
      navigate(`/class/${response.classroom_id}`);
      
    } catch (error: any) {
      console.error("[useJoinClassroomCode] Error joining class:", error);
      const errorMsg = error.message || "An unexpected error occurred";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsJoining(false);
      setLoading(false);
    }
  }, [user, navigate]);

  return {
    classroomCode,
    setClassroomCode,
    scannerOpen,
    setScannerOpen,
    loading,
    setLoading,
    error,
    setError,
    joinClassWithCode,
    autoJoinInProgress
  };
};
