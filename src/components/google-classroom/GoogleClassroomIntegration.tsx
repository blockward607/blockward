
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LogIn, LogOut, RotateCw, BookOpen, Link2, CheckCircle } from "lucide-react";
import GoogleClassroomService, { type GoogleClassroom } from '@/services/google-classroom';
import { GoogleClassroomCourseList } from './GoogleClassroomCourseList';
import { GoogleClassroomImportDialog } from './import-dialog/GoogleClassroomImportDialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [accountLinked, setAccountLinked] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.user_metadata?.google_classroom_linked) {
          setAccountLinked(true);
        }
        
        if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
          console.log("No Google Client ID provided");
          setLoading(false);
          return;
        }
        
        console.log("Initializing Google Classroom with client ID:", clientId);
        
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
        
        // Auto-link account on successful sign-in for better UX
        await supabase.auth.updateUser({
          data: {
            google_classroom_linked: true,
            google_classroom_linked_at: new Date().toISOString()
          }
        });
        setAccountLinked(true);
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
      
      // Auto-unlink account on sign-out for better UX
      await supabase.auth.updateUser({
        data: {
          google_classroom_linked: false,
          google_classroom_linked_at: null
        }
      });
      setAccountLinked(false);
      
      toast.success("Disconnected from Google Classroom");
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

  // Determine if we should show the simple connect UI or the full integration UI
  const showSimpleConnect = !initialized || !signedIn;

  return (
    <Card className="w-full shadow-md border-purple-500/20">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/5 border-b border-purple-500/20">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-500" />
          Google Classroom Integration
        </CardTitle>
        <CardDescription>
          Connect your Google Classroom account to import classes and students
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
            </div>
            <p className="text-center text-sm text-muted-foreground">Connecting to Google Classroom...</p>
          </div>
        ) : showSimpleConnect ? (
          <div className="flex flex-col items-center py-10 px-4 space-y-6">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
            
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-lg font-medium">Connect to Google Classroom</h3>
              <p className="text-sm text-muted-foreground">
                Link your Google Classroom account to import your classes and students with a single click.
              </p>
            </div>
            
            <Button 
              onClick={handleSignIn} 
              className="gap-2 px-6" 
              size="lg"
              disabled={loading || !clientId || clientId === "YOUR_GOOGLE_CLIENT_ID"}
            >
              <LogIn className="h-4 w-4" />
              Connect with Google
            </Button>
            
            {(!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") && (
              <div className="text-sm text-amber-500 dark:text-amber-400 mt-4 text-center max-w-md">
                Please provide a valid Google Client ID in the input field above to enable connection.
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue="courses" className="pt-2">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="courses">My Classes</TabsTrigger>
              <TabsTrigger value="account">Connection Status</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses">
              <GoogleClassroomCourseList 
                courses={courses} 
                onImport={handleImportClass} 
                onRefresh={fetchCourses} 
              />
            </TabsContent>
            
            <TabsContent value="account">
              <div className="space-y-6 p-4">
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <h3 className="font-medium">Successfully connected to Google Classroom</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your BlockWard account is linked to Google Classroom. You can now import classes and students.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Connection summary:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-md bg-muted">
                      <div className="text-xs text-muted-foreground">Status</div>
                      <div className="font-medium">Connected</div>
                    </div>
                    <div className="p-3 rounded-md bg-muted">
                      <div className="text-xs text-muted-foreground">Classes available</div>
                      <div className="font-medium">{courses.length}</div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleSignOut} variant="outline" className="w-full sm:w-auto gap-2">
                    <LogOut className="h-4 w-4" />
                    Disconnect from Google Classroom
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      {!showSimpleConnect && (
        <CardFooter className="bg-muted/50 flex justify-between">
          <Button variant="ghost" size="sm" onClick={fetchCourses} disabled={loading} className="gap-2">
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardFooter>
      )}
      
      {showImportDialog && selectedCourse && (
        <GoogleClassroomImportDialog 
          course={selectedCourse} 
          onClose={handleCloseImportDialog} 
        />
      )}
    </Card>
  );
}
