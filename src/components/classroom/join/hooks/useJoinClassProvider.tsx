
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClassJoinService } from '@/services/class-join';
import { useToast } from '@/hooks/use-toast';
import { useProcessInvitationCode } from './useProcessInvitationCode';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export const useJoinClassProvider = () => {
  const [invitationCode, setInvitationCode] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoJoinInProgress, setAutoJoinInProgress] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { processInvitationCode } = useProcessInvitationCode();

  // Auto-extract code from URL if present
  useEffect(() => {
    const autoExtractCode = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const codeFromUrl = urlParams.get('code');
        
        if (codeFromUrl) {
          console.log("[useJoinClassProvider] Found code in URL:", codeFromUrl);
          const processedCode = processInvitationCode(codeFromUrl);
          
          if (processedCode) {
            console.log("[useJoinClassProvider] Setting invitation code from URL:", processedCode);
            setInvitationCode(processedCode);
            
            // Only auto-join if we have a valid code and the user is logged in
            if (user) {
              console.log("[useJoinClassProvider] User is logged in, attempting auto-join with code:", processedCode);
              setAutoJoinInProgress(true);
              joinClassWithCode(processedCode)
                .finally(() => setAutoJoinInProgress(false));
            } else {
              console.log("[useJoinClassProvider] User not logged in, saving code for later join");
            }
          }
        }
      } catch (err) {
        console.error("[useJoinClassProvider] Error auto-extracting code:", err);
      }
    };

    autoExtractCode();
  }, [user]);

  const joinClassWithCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("[useJoinClassProvider] Joining class with code:", code);
      
      if (!user) {
        setError("Please log in to join a class");
        console.log("[useJoinClassProvider] No user, redirecting to auth");
        // Save the code to localStorage for after login
        localStorage.setItem('pendingJoinCode', code);
        navigate('/auth', { state: { joinCode: code } });
        return;
      }

      if (!code) {
        setError("Please enter an invitation code");
        return;
      }

      // Process the input to extract a valid code
      const processedCode = processInvitationCode(code);
      
      if (!processedCode) {
        setError("Invalid code format");
        return;
      }
      
      console.log("[useJoinClassProvider] Processing join with cleaned code:", processedCode);
      
      // First, try to find the class invitation by token
      const { data: invitation, error: invitationError } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, expires_at, status')
        .eq('invitation_token', processedCode)
        .eq('status', 'pending')
        .single();
      
      if (invitationError) {
        console.error("[useJoinClassProvider] Error finding invitation:", invitationError);
        setError("Invalid or expired invitation code");
        return;
      }
      
      if (!invitation) {
        setError("Invitation not found or expired");
        return;
      }

      // Check if the invitation is still valid
      const expiresAt = new Date(invitation.expires_at);
      const now = new Date();
      
      if (expiresAt < now) {
        setError("This invitation has expired");
        return;
      }
      
      console.log("[useJoinClassProvider] Found valid invitation:", invitation);
      
      // Check if student is already enrolled in this classroom
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('classroom_students')
        .select('id')
        .eq('classroom_id', invitation.classroom_id)
        .eq('student_id', user.id);
      
      if (enrollmentError) {
        console.error("[useJoinClassProvider] Error checking enrollment:", enrollmentError);
        setError("Error checking enrollment status");
        return;
      }
      
      if (enrollments && enrollments.length > 0) {
        setError("You are already enrolled in this class");
        return;
      }
      
      console.log("[useJoinClassProvider] Student not enrolled, proceeding with enrollment");
      
      // Get student profile ID using the students table (not student_profiles)
      const { data: studentProfile, error: profileError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !studentProfile) {
        console.error("[useJoinClassProvider] Error getting student profile:", profileError);
        setError("Student profile not found. Make sure your account is set up correctly.");
        return;
      }
      
      // Enroll the student in the classroom
      const { error: joinError } = await supabase
        .from('classroom_students')
        .insert({
          classroom_id: invitation.classroom_id,
          student_id: studentProfile.id
        });
      
      if (joinError) {
        console.error("[useJoinClassProvider] Error enrolling student:", joinError);
        setError("Error joining classroom: " + joinError.message);
        return;
      }
      
      // Update invitation status to accepted
      const { error: updateError } = await supabase
        .from('class_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);
      
      if (updateError) {
        console.warn("[useJoinClassProvider] Error updating invitation status:", updateError);
        // Not failing the entire operation for this
      }
      
      console.log("[useJoinClassProvider] Student successfully enrolled");
      
      // Get classroom details for the success message
      const { data: classroom } = await supabase
        .from('classrooms')
        .select('name')
        .eq('id', invitation.classroom_id)
        .single();
      
      // Success!
      toast({
        title: "Success!",
        description: `You've joined ${classroom?.name || 'the classroom'}`
      });
      
      // Navigate to class detail page
      navigate(`/class/${invitation.classroom_id}`);
      
    } catch (err: any) {
      console.error("[useJoinClassProvider] Unexpected error in joinClassWithCode:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [navigate, user, toast, processInvitationCode]);

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
