
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LogIn, LogOut, RotateCw, BookOpen } from "lucide-react";
import GoogleClassroomService, { type GoogleClassroom } from '@/services/google-classroom';
import { GoogleClassroomCourseList } from './GoogleClassroomCourseList';
import { GoogleClassroomImportDialog } from './GoogleClassroomImportDialog';
import { toast } from 'sonner';

interface GoogleClassroomIntegrationProps {
  clientId: string;
}

export function GoogleClassroomIntegration({ clientId }: GoogleClassroomIntegrationProps) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [courses, setCourses] = useState<GoogleClassroom[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<GoogleClassroom | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  // Load Google API
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        // Check if client ID is valid
        if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
          console.error("Invalid Google Client ID provided");
          toast.error("Please configure a valid Google Client ID");
          setLoading(false);
          return;
        }
        
        console.log("Initializing Google Classroom with client ID:", clientId);
        
        // Initialize Google Classroom service
        const success = await GoogleClassroomService.initialize(clientId);
        console.log("Initialization result:", success);
        setInitialized(success);
        
        if (success) {
          const isSignedIn = GoogleClassroomService.isSignedIn();
          console.log("User is signed in:", isSignedIn);
          setSignedIn(isSignedIn);
          
          if (isSignedIn) {
            fetchCourses();
          }
        }
      } catch (error) {
        console.error("Error initializing Google Classroom:", error);
        toast.error("Failed to initialize Google Classroom");
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [clientId]);
  
  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log("Fetching courses...");
      const coursesList = await GoogleClassroomService.listCourses();
      console.log("Courses fetched:", coursesList);
      setCourses(coursesList);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch Google Classroom courses");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignIn = async () => {
    try {
      setLoading(true);
      if (!initialized) {
        console.log("Service not initialized, initializing...");
        await GoogleClassroomService.initialize(clientId);
        setInitialized(true);
      }
      
      console.log("Signing in...");
      const success = await GoogleClassroomService.signIn();
      console.log("Sign in result:", success);
      setSignedIn(success);
      
      if (success) {
        toast.success("Successfully connected to Google Classroom");
        fetchCourses();
      }
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Failed to sign in to Google Classroom");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      setLoading(true);
      await GoogleClassroomService.signOut();
      setSignedIn(false);
      setCourses([]);
      setSelectedCourse(null);
      toast.success("Signed out from Google Classroom");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out from Google Classroom");
    } finally {
      setLoading(false);
    }
  };
  
  const handleImportClass = (course: GoogleClassroom) => {
    console.log("Importing course:", course);
    setSelectedCourse(course);
    setShowImportDialog(true);
  };
  
  const handleCloseImportDialog = () => {
    setShowImportDialog(false);
    setSelectedCourse(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-500" />
          Google Classroom Integration
        </CardTitle>
        <CardDescription>
          Connect your Google Classroom account to import classes and students
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : !initialized ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 mb-4">Google Classroom API could not be initialized</p>
            <Button onClick={handleSignIn}>Try Again</Button>
          </div>
        ) : !signedIn ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 mb-4">Connect to Google Classroom to import your classes</p>
            <Button onClick={handleSignIn} className="gap-2">
              <LogIn className="h-4 w-4" />
              Connect Google Classroom
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="courses">
            <TabsList className="grid w-full grid-cols-1 mb-4">
              <TabsTrigger value="courses">My Courses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses">
              <GoogleClassroomCourseList 
                courses={courses} 
                onImport={handleImportClass} 
                onRefresh={fetchCourses} 
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {signedIn && (
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={fetchCourses} disabled={loading} className="gap-2">
              <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut} disabled={loading} className="gap-2">
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
          </div>
        )}
      </CardFooter>
      
      {showImportDialog && selectedCourse && (
        <GoogleClassroomImportDialog 
          course={selectedCourse} 
          onClose={handleCloseImportDialog} 
        />
      )}
    </Card>
  );
}
