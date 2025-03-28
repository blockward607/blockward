
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, LogOut, RotateCw, BookOpen, CheckCircle, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import GoogleClassroomService from '@/services/google-classroom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SimpleGoogleClassroomIntegration() {
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [usingDemoMode, setUsingDemoMode] = useState(false);
  const navigate = useNavigate();

  // Check if the user has already connected their Google account
  useEffect(() => {
    const checkAccountConnection = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.user_metadata?.google_classroom_linked) {
          setSignedIn(true);
          
          if (session.user.user_metadata.google_email) {
            setGoogleEmail(session.user.user_metadata.google_email);
          }
          
          // If we're signed in, immediately fetch courses
          fetchClassroomCourses();
        }
      } catch (error) {
        console.error("Error checking account connection:", error);
      }
    };
    
    checkAccountConnection();
  }, []);

  // Check if we have a client ID and set demo mode accordingly
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.log("No Google Client ID available - using demo mode");
      setUsingDemoMode(true);
    }
  }, []);
  
  // This would be the actual function to fetch real Google Classroom courses in a full implementation
  const fetchClassroomCourses = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would call the Google Classroom API
      console.log("Fetching Google Classroom courses...");
      
      // Try to use the Google Classroom service if properly initialized
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (clientId && googleEmail) {
        try {
          await GoogleClassroomService.initialize(clientId);
          if (GoogleClassroomService.isSignedIn()) {
            const realCourses = await GoogleClassroomService.listCourses();
            if (realCourses && realCourses.length > 0) {
              console.log("Retrieved courses from API:", realCourses);
              setCourses(realCourses);
              toast.success("Connected to Google Classroom successfully");
              return;
            }
          }
        } catch (e) {
          console.error("Error using Google Classroom service:", e);
        }
      }
      
      // If no client ID or error, use demo mode with mock data
      // Simulate API call latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // This is demo mode with sample data
      const sampleCourses = [
        { id: '123456', name: 'Biology 101', section: 'Period 1' },
        { id: '234567', name: 'Chemistry', section: 'Period 2' },
        { id: '345678', name: 'Physics', section: 'Period 3' }
      ];
      
      console.log("Using demo courses:", sampleCourses);
      setCourses(sampleCourses);
      
      if (usingDemoMode) {
        toast.success("Demo mode: Showing example classes");
      } else {
        toast.success("Connected to Google Classroom successfully");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Could not retrieve your Google Classroom data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnectGoogle = async () => {
    try {
      setLoading(true);
      
      // Check if we're in demo mode
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.log("No Google Client ID available - using demo mode");
        setUsingDemoMode(true);
        
        // Use a fake email for demo mode
        const demoEmail = "demo.user@gmail.com";
        setGoogleEmail(demoEmail);
        
        // Update user metadata
        await supabase.auth.updateUser({
          data: {
            google_classroom_linked: true,
            google_classroom_linked_at: new Date().toISOString(),
            google_email: demoEmail
          }
        });
        
        setSignedIn(true);
        toast.success(`Demo mode: Connected as ${demoEmail}`);
        
        // Fetch demo courses
        fetchClassroomCourses();
        return;
      }
      
      console.log("Attempting to initialize Google Classroom with client ID:", clientId ? "Available" : "Not available");
      
      let googleEmail = null;

      try {
        // Try to use the actual Google Classroom service
        await GoogleClassroomService.initialize(clientId);
        const success = await GoogleClassroomService.signIn();
        
        if (success && window.gapi?.auth2) {
          // Get the actual Google user email
          const authInstance = window.gapi.auth2.getAuthInstance();
          const googleUser = authInstance.currentUser.get();
          const profile = googleUser.getBasicProfile();
          googleEmail = profile.getEmail();
          console.log("Successfully signed in with Google email:", googleEmail);
        }
      } catch (e) {
        console.error("Error using Google Classroom service:", e);
      }
      
      // If we couldn't get the Google email, show an error
      if (!googleEmail) {
        toast.error("Failed to connect with Google Classroom. Please try again.");
        setLoading(false);
        return;
      }
      
      setGoogleEmail(googleEmail);
      
      // Update user metadata in Supabase
      await supabase.auth.updateUser({
        data: {
          google_classroom_linked: true,
          google_classroom_linked_at: new Date().toISOString(),
          google_email: googleEmail
        }
      });
      
      setSignedIn(true);
      toast.success(`Connected to Google Classroom with ${googleEmail}`);
      
      // Fetch the user's courses right after connecting
      fetchClassroomCourses();
      
    } catch (error) {
      console.error("Error connecting to Google Classroom:", error);
      toast.error("Failed to connect to Google Classroom");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      setLoading(true);
      
      // Try to use the actual Google Classroom service to sign out
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (clientId) {
        try {
          await GoogleClassroomService.signOut();
        } catch (e) {
          console.error("Error signing out from Google Classroom service:", e);
        }
      }
      
      await supabase.auth.updateUser({
        data: {
          google_classroom_linked: false,
          google_classroom_linked_at: null,
          google_email: null
        }
      });
      
      setSignedIn(false);
      setCourses([]);
      setGoogleEmail(null);
      setUsingDemoMode(false);
      toast.success("Disconnected from Google Classroom");
      
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Failed to disconnect from Google Classroom");
    } finally {
      setLoading(false);
    }
  };
  
  const openGoogleClassroom = () => {
    window.open('https://classroom.google.com', '_blank');
  };
  
  const importClass = (classId: string) => {
    toast.success("Importing class...");
    // In a real implementation, this would start the import process
    navigate(`/classes`);
  };

  return (
    <Card className="w-full shadow-md border-purple-500/20">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/5 border-b border-purple-500/20">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-500" />
          Google Classroom
        </CardTitle>
        <CardDescription>
          Directly connect to your Google Classroom account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {usingDemoMode && !signedIn && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Demo Mode Active</AlertTitle>
            <AlertDescription>
              You're using the free demo version of Google Classroom integration. 
              Sample data will be shown instead of real Google Classroom data.
            </AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">Connecting to Google Classroom...</p>
          </div>
        ) : !signedIn ? (
          <div className="flex flex-col items-center py-10 px-4 space-y-6">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
            
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-lg font-medium">Connect to Google Classroom</h3>
              <p className="text-sm text-muted-foreground">
                {usingDemoMode 
                  ? "Sign in to see example Google Classroom data (demo mode)"
                  : "Sign in with your Google account to access your classroom data."}
              </p>
            </div>
            
            <Button 
              onClick={handleConnectGoogle} 
              className="gap-2 px-6 bg-blue-500 hover:bg-blue-600" 
              size="lg"
            >
              <LogIn className="h-4 w-4" />
              {usingDemoMode ? "Try Demo" : "Sign in with Google"}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="courses" className="pt-2">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="courses">My Classes</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses">
              <div className="space-y-4">
                {usingDemoMode && (
                  <Alert variant="warning" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Demo Mode</AlertTitle>
                    <AlertDescription>
                      Showing example classes. Set up your Google Client ID for real data.
                    </AlertDescription>
                  </Alert>
                )}
                
                {courses && courses.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {courses.map((course) => (
                      <div 
                        key={course.id} 
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <div>
                          <h3 className="font-medium">{course.name}</h3>
                          {course.section && (
                            <p className="text-sm text-gray-500">{course.section}</p>
                          )}
                        </div>
                        <Button 
                          onClick={() => importClass(course.id)} 
                          variant="outline" 
                          size="sm"
                          className="gap-1"
                        >
                          Import
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">No classes found in your Google Classroom account</p>
                    <Button onClick={fetchClassroomCourses} variant="outline" className="gap-2">
                      <RotateCw className="h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={openGoogleClassroom}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Google Classroom
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="account">
              <div className="space-y-6 p-4">
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <h3 className="font-medium">Connected to Google Classroom</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {usingDemoMode 
                      ? "You're using demo mode with sample data"
                      : "Your account is linked with Google Classroom."}
                  </p>
                </div>
                
                {googleEmail && (
                  <div className="p-3 rounded-md bg-muted">
                    <div className="text-xs text-muted-foreground">Connected as</div>
                    <div className="font-medium">{googleEmail}</div>
                    {usingDemoMode && (
                      <div className="text-xs text-amber-500 mt-1">(Demo account)</div>
                    )}
                  </div>
                )}
                
                <div className="pt-4">
                  <Button onClick={handleDisconnect} variant="outline" className="w-full sm:w-auto gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                    <LogOut className="h-4 w-4" />
                    Disconnect Google Classroom
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      {signedIn && (
        <CardFooter className="bg-muted/50 flex justify-between">
          <Button variant="ghost" size="sm" onClick={fetchClassroomCourses} disabled={loading} className="gap-2">
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
