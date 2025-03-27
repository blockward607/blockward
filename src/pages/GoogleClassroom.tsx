
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleGoogleClassroomIntegration } from "@/components/google-classroom/SimpleGoogleClassroomIntegration";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GoogleClassroom = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/classes')} className="mr-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Classes
        </Button>
        <h1 className="text-3xl font-bold">Google Classroom</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SimpleGoogleClassroomIntegration />
        </div>
        
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Quick Setup Guide</CardTitle>
              <CardDescription>Easy steps to connect Google Classroom</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium">1</div>
                  <div>
                    <h3 className="font-medium">Click "Connect to Google Classroom"</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the connect button to start the login process
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium">2</div>
                  <div>
                    <h3 className="font-medium">Sign in with Google</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your Google account credentials to connect
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium">3</div>
                  <div>
                    <h3 className="font-medium">Grant permissions</h3>
                    <p className="text-sm text-muted-foreground">
                      Allow access to your Google Classroom data
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium">4</div>
                  <div>
                    <h3 className="font-medium">View and import your classes</h3>
                    <p className="text-sm text-muted-foreground">
                      After connecting, you can view and import your classes
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md bg-blue-500/10 p-3 border border-blue-500/20">
                <p className="text-sm">
                  <span className="font-medium">Need help?</span> Check out the <a href="https://classroom.google.com/u/0/h" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Google Classroom website</a> for more information.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoogleClassroom;
