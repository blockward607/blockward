
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Link2, Unlink } from "lucide-react"; // Changed Google to BookOpen
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import GoogleClassroomService from "@/services/google-classroom";
import { supabase } from "@/integrations/supabase/client";

export function GoogleClassroomTab() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLinked, setIsLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);

  useEffect(() => {
    checkAccountLinkStatus();
  }, []);

  const checkAccountLinkStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUserEmail(session.user.email);
      
      // Check if Google Classroom service is initialized and user is signed in
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
      if (clientId) {
        await GoogleClassroomService.initialize(clientId);
        const isSignedIn = GoogleClassroomService.isSignedIn();
        setIsLinked(isSignedIn);
        
        if (isSignedIn && window.gapi?.auth2) {
          const authInstance = window.gapi.auth2.getAuthInstance();
          const googleUser = authInstance.currentUser.get();
          const profile = googleUser.getBasicProfile();
          setGoogleEmail(profile.getEmail());
        }
      }
    } catch (error) {
      console.error("Error checking account link status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    try {
      setIsLoading(true);
      
      // Initialize Google Classroom API
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
      if (!clientId) {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Google Classroom client ID is not configured."
        });
        navigate('/google-classroom');
        return;
      }
      
      await GoogleClassroomService.initialize(clientId);
      
      // Sign in with Google
      const success = await GoogleClassroomService.signIn();
      
      if (success) {
        setIsLinked(true);
        
        // Get Google user email for display
        if (window.gapi?.auth2) {
          const authInstance = window.gapi.auth2.getAuthInstance();
          const googleUser = authInstance.currentUser.get();
          const profile = googleUser.getBasicProfile();
          setGoogleEmail(profile.getEmail());
        }
        
        toast({
          title: "Account Linked",
          description: "Your BlockWard account is now linked to Google Classroom."
        });
        
        // Save linking status in user metadata
        await supabase.auth.updateUser({
          data: {
            google_classroom_linked: true,
            google_classroom_linked_at: new Date().toISOString()
          }
        });
      } else {
        toast({
          variant: "destructive",
          title: "Link Failed",
          description: "Failed to link Google Classroom account. Please try again."
        });
      }
    } catch (error) {
      console.error("Error linking account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while linking your account."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlinkAccount = async () => {
    try {
      setIsLoading(true);
      
      await GoogleClassroomService.signOut();
      setIsLinked(false);
      setGoogleEmail(null);
      
      toast({
        title: "Account Unlinked",
        description: "Your Google Classroom account has been unlinked."
      });
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          google_classroom_linked: false,
          google_classroom_linked_at: null
        }
      });
    } catch (error) {
      console.error("Error unlinking account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while unlinking your account."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Google Classroom Integration</h3>
        <p className="text-sm text-muted-foreground">
          Link your BlockWard account with Google Classroom to import classes and students
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-red-500" /> {/* Changed Google to BookOpen */}
            Google Classroom Connection
          </CardTitle>
          <CardDescription>
            {isLinked 
              ? "Your account is linked to Google Classroom" 
              : "Connect your BlockWard account to Google Classroom"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {userEmail && (
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm font-medium">BlockWard Account</p>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
              )}
              
              {isLinked && googleEmail && (
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm font-medium">Google Classroom Account</p>
                  <p className="text-sm text-muted-foreground">{googleEmail}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                {isLinked ? (
                  <Button 
                    variant="outline" 
                    onClick={handleUnlinkAccount} 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Unlink className="h-4 w-4" />
                    Unlink Account
                  </Button>
                ) : (
                  <Button 
                    onClick={handleLinkAccount} 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Link2 className="h-4 w-4" />
                    Link with Google Classroom
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        <p>By linking your account, you can:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Import your Google Classroom classes</li>
          <li>Import students from your classes</li>
          <li>Sync assignments and grades</li>
        </ul>
      </div>
    </div>
  );
}
