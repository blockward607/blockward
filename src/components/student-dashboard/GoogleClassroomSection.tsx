
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Link2, Unlink, RefreshCw, ExternalLink } from "lucide-react";
import GoogleClassroomService from "@/services/google-classroom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function GoogleClassroomSection() {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    checkLinkStatus();
  }, []);

  const checkLinkStatus = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      // Check if account is linked in metadata
      if (session.user.user_metadata?.google_classroom_linked) {
        setIsLinked(true);
      }
      
      // Initialize Google Classroom
      const clientId = localStorage.getItem('google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
      if (clientId) {
        const initialized = await GoogleClassroomService.initialize(clientId);
        setIsInitialized(initialized);
        
        if (initialized) {
          const signedIn = GoogleClassroomService.isSignedIn();
          setIsSignedIn(signedIn);
          
          if (signedIn) {
            // Get Google user email
            if (window.gapi?.auth2) {
              const authInstance = window.gapi.auth2.getAuthInstance();
              const googleUser = authInstance.currentUser.get();
              const profile = googleUser.getBasicProfile();
              setGoogleEmail(profile.getEmail());
            }
            
            // Fetch classes where student is enrolled
            fetchClasses();
          }
        }
      }
    } catch (error) {
      console.error("Error checking link status:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const courses = await GoogleClassroomService.listCourses();
      setClasses(courses.slice(0, 3)); // Show only first 3 classes
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleLinkAccount = async () => {
    try {
      setLoading(true);
      
      // Initialize Google Classroom API
      const clientId = localStorage.getItem('google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
      if (!clientId) {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Google Classroom client ID is not configured."
        });
        return;
      }
      
      const initialized = await GoogleClassroomService.initialize(clientId);
      setIsInitialized(initialized);
      
      if (initialized) {
        // Sign in with Google
        const success = await GoogleClassroomService.signIn();
        setIsSignedIn(success);
        
        if (success) {
          // Get Google user email
          if (window.gapi?.auth2) {
            const authInstance = window.gapi.auth2.getAuthInstance();
            const googleUser = authInstance.currentUser.get();
            const profile = googleUser.getBasicProfile();
            setGoogleEmail(profile.getEmail());
          }
          
          // Update user metadata
          await supabase.auth.updateUser({
            data: {
              google_classroom_linked: true,
              google_classroom_linked_at: new Date().toISOString()
            }
          });
          
          setIsLinked(true);
          toast({
            title: "Account Linked",
            description: "Your account is now linked to Google Classroom."
          });
          
          // Fetch classes
          fetchClasses();
        } else {
          toast({
            variant: "destructive",
            title: "Link Failed",
            description: "Failed to link Google Classroom account."
          });
        }
      }
    } catch (error) {
      console.error("Error linking account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while linking your account."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkAccount = async () => {
    try {
      setLoading(true);
      
      // Sign out from Google
      await GoogleClassroomService.signOut();
      setIsSignedIn(false);
      setGoogleEmail(null);
      setClasses([]);
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          google_classroom_linked: false,
          google_classroom_linked_at: null
        }
      });
      
      setIsLinked(false);
      toast({
        title: "Account Unlinked",
        description: "Your Google Classroom account has been unlinked."
      });
    } catch (error) {
      console.error("Error unlinking account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while unlinking your account."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchClasses();
  };
  
  const openGoogleClassroom = () => {
    window.open('https://classroom.google.com', '_blank');
  };

  if (!isInitialized && !isLinked) {
    return null; // Don't show anything if Google Classroom isn't initialized or linked
  }

  return (
    <Card className="overflow-hidden border-blue-500/20">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/5">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-500" />
          Google Classroom
        </CardTitle>
        <CardDescription>
          {isLinked 
            ? "Your account is linked with Google Classroom" 
            : "Link your account with Google Classroom"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : !isSignedIn ? (
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Connect to Google Classroom to see your classes and assignments
            </p>
            <Button onClick={handleLinkAccount} className="gap-2">
              <Link2 className="h-4 w-4" />
              Connect Classroom
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {googleEmail && (
              <div className="text-sm bg-muted p-2 rounded-md">
                <span className="font-medium">Connected as:</span> {googleEmail}
              </div>
            )}
            
            {classes.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Your Classes</h3>
                  <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-8 w-8 p-0">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <ul className="space-y-2">
                  {classes.map((cls) => (
                    <li key={cls.id} className="text-sm p-3 rounded bg-muted flex justify-between items-center">
                      <span>{cls.name}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2 gap-2"
                  onClick={openGoogleClassroom}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Google Classroom
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">No classes found in your Google Classroom account</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openGoogleClassroom}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Google Classroom
                </Button>
              </div>
            )}
            
            <div className="pt-3 border-t">
              <Button 
                variant="ghost" 
                onClick={handleUnlinkAccount} 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-2"
              >
                <Unlink className="h-4 w-4" />
                Disconnect Account
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
