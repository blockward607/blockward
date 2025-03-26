import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LogIn, LogOut, RotateCw, BookOpen, Link2 } from "lucide-react";
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
          console.error("Invalid Google Client ID provided");
          toast.error("Please configure a valid Google Client ID");
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
  
  const handleLinkAccount = async () => {
    try {
      if (signedIn) {
        await supabase.auth.updateUser({
          data: {
            google_classroom_linked: true,
            google_classroom_linked_at: new Date().toISOString()
          }
        });
        
        setAccountLinked(true);
        toast.success("Account successfully linked to Google Classroom");
      } else {
        toast.error("Please sign in to Google Classroom first");
      }
    } catch (error) {
      console.error("Error linking account:", error);
      toast.error("Failed to link account");
    }
  };
  
  const handleUnlinkAccount = async () => {
    try {
      await supabase.auth.updateUser({
        data: {
          google_classroom_linked: false,
          google_classroom_linked_at: null
        }
      });
      
      setAccountLinked(false);
      toast.success("Account unlinked from Google Classroom");
    } catch (error) {
      console.error("Error unlinking account:", error);
      toast.error("Failed to unlink account");
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
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses">
              <GoogleClassroomCourseList 
                courses={courses} 
                onImport={handleImportClass} 
                onRefresh={fetchCourses} 
              />
            </TabsContent>
            
            <TabsContent value="account">
              <div className="space-y-4 p-4">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Google Classroom Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {accountLinked 
                      ? "Your BlockWard account is linked to Google Classroom" 
                      : "Link your BlockWard account to Google Classroom for seamless integration"}
                  </p>
                  
                  {accountLinked ? (
                    <Button variant="outline" onClick={handleUnlinkAccount} className="w-full sm:w-auto">
                      Unlink Account
                    </Button>
                  ) : (
                    <Button onClick={handleLinkAccount} className="w-full sm:w-auto flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      Link Account
                    </Button>
                  )}
                </div>
                
                <div className="text-sm">
                  <p className="font-medium">Benefits of linking:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Automatically sync class information</li>
                    <li>Import students with one click</li>
                    <li>Keep your BlockWard and Google Classroom data in sync</li>
                  </ul>
                </div>
              </div>
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
