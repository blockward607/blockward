
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import GoogleClassroomService from '@/services/google-classroom';
import { loadGoogleApi } from '@/utils/googleApiLoader';
import type { GoogleClassroom } from '@/services/google-classroom';

export interface UseGoogleClassroomReturn {
  googleClassrooms: GoogleClassroom[];
  loadingClassrooms: boolean;
  fetchGoogleClassrooms: () => Promise<void>;
  checkGoogleClassroomCode: (code: string) => Promise<GoogleClassroom | null>;
  isAuthenticated: boolean;
  authenticateWithGoogle: () => Promise<boolean>;
}

export const useGoogleClassroom = (userId?: string): UseGoogleClassroomReturn => {
  const [googleClassrooms, setGoogleClassrooms] = useState<GoogleClassroom[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Initialize Google Classroom and check authentication status
  useEffect(() => {
    const initializeGoogleClassroom = async () => {
      try {
        // Initialize Google API client
        await loadGoogleApi();
        
        // Check if Google API is initialized
        if (window.gapi) {
          // Initialize with a client ID from environment or use demo mode
          const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
          
          if (clientId) {
            const initialized = await GoogleClassroomService.initialize(clientId);
            if (initialized) {
              // Check if user is signed in to Google
              const isSignedIn = GoogleClassroomService.isSignedIn();
              setIsAuthenticated(isSignedIn);
              
              if (isSignedIn) {
                fetchGoogleClassrooms();
              }
            }
          } else {
            console.log("No Google Client ID available for classroom integration");
          }
        }
      } catch (err) {
        console.error("Error initializing Google Classroom:", err);
      }
    };

    if (userId) {
      initializeGoogleClassroom();
    }
  }, [userId]);

  // Fetch Google Classrooms
  const fetchGoogleClassrooms = useCallback(async () => {
    try {
      setLoadingClassrooms(true);
      console.log("Fetching Google Classrooms...");
      
      const courses = await GoogleClassroomService.listCourses();
      setGoogleClassrooms(courses);
      console.log("Google Classrooms fetched:", courses);
      
      return courses;
    } catch (err) {
      console.error("Error fetching Google Classrooms:", err);
      toast({
        title: "Google Classroom Error",
        description: "Failed to fetch classrooms",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoadingClassrooms(false);
    }
  }, [toast]);

  // Authenticate with Google
  const authenticateWithGoogle = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Authenticating with Google Classroom...");
      setLoadingClassrooms(true);
      
      // Initialize with a client ID from environment
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
      
      if (!clientId) {
        toast({
          title: "Configuration Error",
          description: "Google Client ID is not configured",
          variant: "destructive"
        });
        return false;
      }
      
      // Initialize Google API client
      await loadGoogleApi();
      const initialized = await GoogleClassroomService.initialize(clientId);
      
      if (!initialized) {
        toast({
          title: "Initialization Failed",
          description: "Could not initialize Google Classroom API",
          variant: "destructive"
        });
        return false;
      }
      
      // Sign in to Google
      const signedIn = await GoogleClassroomService.signIn();
      setIsAuthenticated(signedIn);
      
      if (signedIn) {
        toast({
          title: "Success",
          description: "Connected to Google Classroom"
        });
        await fetchGoogleClassrooms();
      }
      
      return signedIn;
    } catch (err) {
      console.error("Error authenticating with Google:", err);
      toast({
        title: "Authentication Failed",
        description: "Could not connect to Google Classroom",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoadingClassrooms(false);
    }
  }, [fetchGoogleClassrooms, toast]);

  // Check if a Google Classroom code is valid
  const checkGoogleClassroomCode = useCallback(async (code: string): Promise<GoogleClassroom | null> => {
    try {
      console.log("Checking if code matches a Google Classroom:", code);
      
      if (!isAuthenticated) {
        console.log("User not authenticated with Google Classroom");
        return null;
      }
      
      // If we don't have courses yet, fetch them
      let coursesToCheck = googleClassrooms;
      if (coursesToCheck.length === 0) {
        coursesToCheck = await fetchGoogleClassrooms();
      }
      
      // Find a matching course by ID or enrollment code
      const matchingCourse = coursesToCheck.find(
        course => course.id === code || course.enrollmentCode === code
      );
      
      if (matchingCourse) {
        console.log("Found matching Google Classroom:", matchingCourse.name);
        return matchingCourse;
      }
      
      console.log("No matching Google Classroom found for code:", code);
      return null;
    } catch (err) {
      console.error("Error checking Google Classroom code:", err);
      return null;
    }
  }, [fetchGoogleClassrooms, googleClassrooms, isAuthenticated]);

  return {
    googleClassrooms,
    loadingClassrooms,
    fetchGoogleClassrooms,
    checkGoogleClassroomCode,
    isAuthenticated,
    authenticateWithGoogle
  };
};

