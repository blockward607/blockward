
import { useState, useEffect } from 'react';
import GoogleClassroomService from '@/services/google-classroom';
import type { GoogleClassroom } from '@/services/google-classroom';
import { toast } from 'sonner';

export const useGoogleClassroom = (userId?: string) => {
  const [googleClassrooms, setGoogleClassrooms] = useState<GoogleClassroom[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
          console.log("No Google Client ID available");
          return;
        }
        
        // Initialize the Google API client
        await GoogleClassroomService.initialize(clientId);
        
        // Check if the user is already signed in
        const isSignedIn = GoogleClassroomService.isSignedIn();
        console.log("User is signed in to Google Classroom:", isSignedIn);
        setIsAuthenticated(isSignedIn);
        
        // If signed in, fetch classrooms
        if (isSignedIn) {
          fetchGoogleClassrooms();
        }
      } catch (error) {
        console.error("Error checking Google auth:", error);
      }
    };
    
    if (userId) {
      checkAuth();
    }
  }, [userId]);
  
  // Fetch Google Classroom courses
  const fetchGoogleClassrooms = async () => {
    try {
      setLoading(true);
      console.log("Fetching Google Classroom courses...");
      
      const courses = await GoogleClassroomService.listCourses();
      setGoogleClassrooms(courses);
      console.log("Retrieved Google Classroom courses:", courses.length);
      
      return courses;
    } catch (error) {
      console.error("Error fetching Google Classroom courses:", error);
      toast.error("Failed to fetch Google Classroom courses");
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Authenticate with Google Classroom
  const authenticateWithGoogle = async (): Promise<boolean> => {
    try {
      setLoading(true);
      console.log("Authenticating with Google Classroom...");
      
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.error("No Google Client ID configured");
        toast.error("Google Classroom integration is not configured");
        return false;
      }
      
      // Initialize the client
      await GoogleClassroomService.initialize(clientId);
      
      // Sign in the user
      const success = await GoogleClassroomService.signIn();
      setIsAuthenticated(success);
      
      if (success) {
        // Fetch courses if sign-in was successful
        fetchGoogleClassrooms();
      }
      
      return success;
    } catch (error) {
      console.error("Error authenticating with Google:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Check if a code matches any Google Classroom
  const checkGoogleClassroomCode = async (code: string): Promise<GoogleClassroom | null> => {
    try {
      console.log("Checking if code matches a Google Classroom:", code);
      
      // Ensure we're authenticated and have courses
      if (!isAuthenticated) {
        console.log("Not authenticated with Google Classroom");
        return null;
      }
      
      // If we don't have courses yet, fetch them
      let coursesToCheck = googleClassrooms;
      if (coursesToCheck.length === 0) {
        coursesToCheck = await fetchGoogleClassrooms();
      }
      
      // Check if any course matches by enrollment code or ID
      const matchingCourse = coursesToCheck.find(
        course => course.enrollmentCode === code || course.id === code
      );
      
      console.log("Matching Google Classroom course:", matchingCourse);
      return matchingCourse || null;
    } catch (error) {
      console.error("Error checking Google Classroom code:", error);
      return null;
    }
  };
  
  return {
    googleClassrooms,
    loading,
    isAuthenticated,
    authenticateWithGoogle,
    fetchGoogleClassrooms,
    checkGoogleClassroomCode
  };
};
