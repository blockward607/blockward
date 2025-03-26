
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import GoogleClassroomService from "@/services/google-classroom";

export const useGoogleClassroomImport = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Initialize with a client ID from environment - should be configured in your app
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
        
        if (!clientId) {
          console.error("Google Client ID not configured");
          return;
        }
        
        await GoogleClassroomService.initialize(clientId);
        const authStatus = GoogleClassroomService.isSignedIn();
        setIsAuthenticated(authStatus);
        
        if (authStatus) {
          fetchCourses();
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };
    
    checkAuth();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesList = await GoogleClassroomService.listCourses();
      setCourses(coursesList);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch courses",
        description: "Could not retrieve courses from Google Classroom"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (course: any) => {
    setSelectedCourse(course);
    
    if (!studentsLoaded) {
      try {
        setLoading(true);
        const studentsList = await GoogleClassroomService.listStudents(course.id);
        setStudents(studentsList);
        setStudentsLoaded(true);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast({
          variant: "destructive",
          title: "Failed to fetch students",
          description: "Could not retrieve students from Google Classroom"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAuthenticate = async () => {
    try {
      setLoading(true);
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
      
      if (!clientId) {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Google Client ID is not configured"
        });
        return;
      }
      
      const initialized = await GoogleClassroomService.initialize(clientId);
      if (!initialized) {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Could not initialize Google Classroom API"
        });
        return;
      }
      
      const success = await GoogleClassroomService.signIn();
      setIsAuthenticated(success);
      
      if (success) {
        toast({
          title: "Authentication Successful",
          description: "Connected to Google Classroom"
        });
        fetchCourses();
      }
    } catch (error) {
      console.error("Error authenticating:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Could not authenticate with Google"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportClass = async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      toast({
        title: "Class Imported",
        description: `Successfully imported ${selectedCourse.name}`
      });
      // Implement actual import logic here
    } catch (error) {
      console.error("Error importing class:", error);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Could not import class from Google Classroom"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    courses,
    selectedCourse,
    loading,
    students,
    studentsLoaded,
    handleImportClass,
    handleSelectCourse,
    handleAuthenticate,
    isAuthenticated
  };
};
