
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useJoinClassProvider = () => {
  const [invitationCode, setInvitationCode] = useState('');
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
          console.log("[useJoinClassProvider] Found code in URL:", codeFromUrl);
          setInvitationCode(codeFromUrl);
          
          if (user) {
            console.log("[useJoinClassProvider] User is logged in, attempting auto-join with code:", codeFromUrl);
            setAutoJoinInProgress(true);
            joinClassWithCode(codeFromUrl)
              .finally(() => setAutoJoinInProgress(false));
          }
        }
      } catch (err) {
        console.error("[useJoinClassProvider] Error auto-extracting code:", err);
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
          
      console.log("[useJoinClassProvider] Student profile check result:", { student, studentError });

      if (student?.id) {
        return student.id;
      }

      // Create student profile if it doesn't exist
      console.log("[useJoinClassProvider] Creating student profile for user:", session.user.id);
      
      const { data: newStudent, error: createError } = await supabase
        .from('students')
        .insert({
          user_id: session.user.id,
          name: session.user.email?.split('@')[0] || 'Student'
        })
        .select('id')
        .single();

      if (createError) {
        console.error("[useJoinClassProvider] Error creating student profile:", createError);
        return null;
      }
      
      console.log("[useJoinClassProvider] Student profile created:", newStudent);

      // Set user role as student
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: session.user.id,
          role: 'student'
        });

      if (roleError) {
        console.error("[useJoinClassProvider] Error setting user role:", roleError);
      }

      return newStudent.id;
    } catch (error) {
      console.error("[useJoinClassProvider] Error in ensureStudentProfile:", error);
      return null;
    }
  };

  const joinClassWithCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    setIsJoining(true);
    
    try {
      console.log("[useJoinClassProvider] Joining class with code:", code);
      
      if (!user) {
        setError("Please log in to join a class");
        console.log("[useJoinClassProvider] No user, redirecting to auth");
        localStorage.setItem('pendingJoinCode', code);
        navigate('/auth', { state: { joinCode: code } });
        return;
      }

      if (!code.trim()) {
        setError("Please enter an invitation code");
        return;
      }
      
      // Normalize the code - remove spaces and convert to uppercase
      const normalizedCode = code.trim().toUpperCase();
      console.log("[useJoinClassProvider] Processing join with normalized code:", normalizedCode);
      
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

      // Look for valid invitation with this code - use a more direct approach
      console.log("[useJoinClassProvider] Looking for invitation with code:", normalizedCode);
      const { data: invitation, error: inviteError } = await supabase
        .from('class_invitations')
        .select(`
          id,
          classroom_id,
          invitation_token,
          expires_at,
          status,
          classroom:classrooms(
            id,
            name,
            description
          )
        `)
        .eq('invitation_token', normalizedCode)
        .eq('status', 'pending')
        .maybeSingle();
        
      if (inviteError) {
        console.error("[useJoinClassProvider] Error looking up invitation:", inviteError);
        setError("Error looking up invitation code");
        return;
      }
      
      if (!invitation) {
        console.log("[useJoinClassProvider] No invitation found for code:", normalizedCode);
        
        // Try a case-insensitive search as fallback
        const { data: fallbackInvitation, error: fallbackError } = await supabase
          .from('class_invitations')
          .select(`
            id,
            classroom_id,
            invitation_token,
            expires_at,
            status,
            classroom:classrooms(
              id,
              name,
              description
            )
          `)
          .ilike('invitation_token', normalizedCode)
          .eq('status', 'pending')
          .maybeSingle();
          
        if (fallbackError) {
          console.error("[useJoinClassProvider] Error in fallback search:", fallbackError);
        }
        
        if (!fallbackInvitation) {
          setError("Invalid invitation code. Please check your code and try again.");
          return;
        }
        
        // Use the fallback invitation
        invitation = fallbackInvitation;
      }
      
      // Check if invitation has expired
      const expiresAt = new Date(invitation.expires_at);
      const now = new Date();
      
      if (expiresAt < now) {
        console.log("[useJoinClassProvider] Invitation has expired:", { expiresAt, now });
        setError("This invitation has expired. Please ask your teacher for a new code.");
        return;
      }
      
      const classroomId = invitation.classroom_id;
      const classroomName = invitation.classroom?.name || "the classroom";
      const invitationId = invitation.id;
      
      console.log("[useJoinClassProvider] Found valid invitation:", { classroomId, classroomName, invitationId });
      
      // Check if already enrolled
      const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
        .from('classroom_students')
        .select('id')
        .eq('classroom_id', classroomId)
        .eq('student_id', studentId)
        .maybeSingle();
      
      if (enrollmentCheckError) {
        console.error("[useJoinClassProvider] Error checking enrollment:", enrollmentCheckError);
      }
        
      if (existingEnrollment) {
        console.log("[useJoinClassProvider] Student already enrolled in this classroom");
        toast.success("You are already a member of this classroom");
        navigate(`/class/${classroomId}`);
        return;
      }
      
      // Enroll the student
      console.log("[useJoinClassProvider] Enrolling student in classroom:", { classroomId, studentId });
      const { data: enrollData, error: enrollError } = await supabase
        .from('classroom_students')
        .insert({
          classroom_id: classroomId,
          student_id: studentId
        })
        .select();
      
      if (enrollError) {
        console.error("[useJoinClassProvider] Error enrolling student:", enrollError);
        setError("Error joining classroom: " + (enrollError.message || "Unknown error"));
        return;
      }

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('class_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);
        
      if (updateError) {
        console.error("[useJoinClassProvider] Error updating invitation status:", updateError);
        // Non-blocking error, continue
      }

      console.log("[useJoinClassProvider] Successfully joined classroom:", classroomName);
      toast.success(`You've joined ${classroomName}`);
      
      navigate(`/class/${classroomId}`);
      
    } catch (error: any) {
      console.error("[useJoinClassProvider] Error joining class:", error);
      const errorMsg = error.message || "An unexpected error occurred";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsJoining(false);
      setLoading(false);
    }
  }, [user, navigate]);

  return {
    invitationCode,
    setInvitationCode,
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
