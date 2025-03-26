
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Google, Link2, Unlink, RefreshCw } from "lucide-react";
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
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
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
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
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

  if (!isInitialized) {
    return null; // Don't show anything if Google Classroom isn't initialized
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Google className="h-5 w-5 text-red-500" />
          Google Classroom
        </CardTitle>
        <CardDescription>
          {isLinked 
            ? "Your account is linked with Google Classroom" 
            : "Link your account with Google Classroom"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : !isSignedIn ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-400 mb-4">
              Connect to Google Classroom to see your classes
            </p>
            <Button onClick={handleLinkAccount} className="gap-2">
              <Link2 className="h-4 w-4" />
              Link Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {googleEmail && (
              <div className="text-sm">
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
                    <li key={cls.id} className="text-sm p-2 rounded bg-muted">
                      {cls.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No classes found in your Google Classroom account</p>
            )}
            
            <Button variant="outline" onClick={handleUnlinkAccount} size="sm" className="gap-2">
              <Unlink className="h-4 w-4" />
              Unlink Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
