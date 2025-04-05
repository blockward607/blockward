
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClassJoinService } from '@/services/class-join';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { loadGoogleApi } from '@/utils/googleApiLoader';
import GoogleClassroomService from '@/services/google-classroom';

export const useJoinClassProvider = () => {
  const [invitationCode, setInvitationCode] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoJoinInProgress, setAutoJoinInProgress] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [googleClassrooms, setGoogleClassrooms] = useState<any[]>([]);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch Google Classrooms when component mounts
  useEffect(() => {
    const fetchGoogleClassrooms = async () => {
      try {
        // Initialize Google API client
        await loadGoogleApi();
        
        // Check if Google API is initialized
        if (window.gapi) {
          // Initialize with a client ID from environment or use demo mode
          const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
          
          if (clientId) {
            await GoogleClassroomService.initialize(clientId);
            
            // Only proceed if user is signed in to Google
            if (GoogleClassroomService.isSignedIn()) {
              const courses = await GoogleClassroomService.listCourses();
              setGoogleClassrooms(courses);
              console.log("Google Classrooms fetched:", courses);
            } else {
              console.log("User not signed in to Google Classroom");
            }
          } else {
            console.log("No Google Client ID available for classroom integration");
          }
        }
      } catch (err) {
        console.error("Error fetching Google Classrooms:", err);
        toast({
          title: "Google Classroom Error",
          description: "Failed to fetch classrooms",
          variant: "destructive"
        });
      }
    };

    if (user) {
      fetchGoogleClassrooms();
    }
  }, [user, toast]);

  // Auto-extract code from URL if present
  useEffect(() => {
    const autoExtractCode = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const codeFromUrl = urlParams.get('code');
        
        if (codeFromUrl) {
          console.log("[useJoinClassProvider] Found code in URL:", codeFromUrl);
          
          // Set the code without processing
          setInvitationCode(codeFromUrl);
          
          // Only auto-join if we have a valid code and the user is logged in
          if (user) {
            console.log("[useJoinClassProvider] User is logged in, attempting auto-join with code:", codeFromUrl);
            setAutoJoinInProgress(true);
            joinClassWithCode(codeFromUrl)
              .finally(() => setAutoJoinInProgress(false));
          } else {
            console.log("[useJoinClassProvider] User not logged in, saving code for later join");
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
    setIsJoining(true);
    
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
      
      console.log("[useJoinClassProvider] Processing join with code:", code);
      
      // First try local matching
      const { data: matchData, error: matchError } = 
        await ClassJoinService.findClassroomOrInvitation(code);
      
      console.log("Match result:", matchData, matchError);
      
      if (matchError || !matchData) {
        console.error("[useJoinClassProvider] Error finding classroom or invitation:", matchError);
        
        // If no local match, try Google Classroom
        try {
          if (window.gapi) {
            // Initialize with a client ID from environment
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
            
            if (clientId) {
              // Initialize Google Classroom service
              await GoogleClassroomService.initialize(clientId);
              
              // Check if user is signed in to Google
              if (!GoogleClassroomService.isSignedIn()) {
                await GoogleClassroomService.signIn();
              }
              
              // Get all courses
              const courses = await GoogleClassroomService.listCourses();
              
              // Find a matching course
              const matchingGoogleClass = courses.find(
                (course) => course.id === code || course.enrollmentCode === code
              );
              
              if (matchingGoogleClass) {
                toast({
                  title: "Google Classroom Found",
                  description: `Imported class: ${matchingGoogleClass.name}`
                });
                
                // Here you could add logic to save the Google Classroom to your local database
                navigate('/dashboard');
                return;
              }
            }
          }
        } catch (googleError) {
          console.error("Error checking Google Classroom:", googleError);
        }
        
        setError(matchError?.message || "Invalid code. Please check your code and try again.");
        return;
      }
      
      // Determine the classroom to join
      const classroomId = matchData.classroomId;
      const classroomName = matchData.classroom?.name || "the classroom";
      const invitationId = matchData.invitationId;
      
      console.log("[useJoinClassProvider] Found classroom to join:", { classroomId, classroomName });
      
      // Check if already enrolled
      const { data: existingEnrollment, error: enrollmentError } = 
        await ClassJoinService.checkEnrollment(classroomId);
      
      if (enrollmentError) {
        console.error("[useJoinClassProvider] Error checking enrollment:", enrollmentError);
      }
        
      if (existingEnrollment && existingEnrollment.length > 0) {
        console.log("[useJoinClassProvider] Student already enrolled in this classroom");
        toast({
          title: "Already enrolled",
          description: "You are already a member of this classroom"
        });
        navigate(`/class/${classroomId}`);
        return;
      }
      
      // Enroll the student
      console.log("[useJoinClassProvider] Enrolling student in classroom:", { classroomId, invitationId });
      const { data: enrollData, error: enrollError } = await ClassJoinService.enrollStudent(classroomId, invitationId);
      
      if (enrollError) {
        console.error("[useJoinClassProvider] Error enrolling student:", enrollError);
        setError("Error joining classroom: " + (enrollError.message || "Unknown error"));
        return;
      }

      // Success!
      console.log("[useJoinClassProvider] Successfully joined classroom:", classroomName);
      toast({
        title: "Success!",
        description: `You've joined ${classroomName || 'the classroom'}`
      });
      
      // Redirect to class details page
      navigate(`/class/${classroomId}`);
      
    } catch (error: any) {
      console.error("[useJoinClassProvider] Error joining class:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsJoining(false);
      setLoading(false);
    }
  }, [user, navigate, toast]);

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
    autoJoinInProgress,
    googleClassrooms,
  };
};
