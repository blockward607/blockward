
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Link2, Unlink, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function GoogleClassroomSection() {
  const { toast } = useToast();
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
        setIsSignedIn(true);
        
        // Get Google user email from metadata
        if (session.user.user_metadata.google_email) {
          setGoogleEmail(session.user.user_metadata.google_email);
        }
        
        // Fetch demo classes (in a real implementation, this would come from the API)
        fetchClasses();
      }
    } catch (error) {
      console.error("Error checking link status:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      // For demo purposes, let's create some sample classes
      const sampleClasses = [
        { id: "123456", name: "Math 101" },
        { id: "234567", name: "Science" },
        { id: "345678", name: "History" }
      ];
      setClasses(sampleClasses.slice(0, 3));
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleLinkAccount = async () => {
    try {
      setLoading(true);
      
      // Simulate Google sign in (in a real implementation, this would use Google OAuth)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set mock email
      const email = "student@gmail.com";
      setGoogleEmail(email);
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          google_classroom_linked: true,
          google_classroom_linked_at: new Date().toISOString(),
          google_email: email
        }
      });
      
      setIsLinked(true);
      setIsSignedIn(true);
      toast({
        title: "Account Linked",
        description: "Your account is now linked to Google Classroom."
      });
      
      // Fetch classes
      fetchClasses();
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
      
      // Simulate sign out
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsSignedIn(false);
      setGoogleEmail(null);
      setClasses([]);
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          google_classroom_linked: false,
          google_classroom_linked_at: null,
          google_email: null
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
