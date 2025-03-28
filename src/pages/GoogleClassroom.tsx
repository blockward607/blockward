
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleGoogleClassroomIntegration } from "@/components/google-classroom/SimpleGoogleClassroomIntegration";
import { ArrowLeft, BookOpen, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const GoogleClassroom = () => {
  const navigate = useNavigate();
  const hasGoogleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/classes')} className="mr-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Classes
        </Button>
        <h1 className="text-3xl font-bold">Google Classroom</h1>
      </div>

      {!hasGoogleClientId && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Free Demo Mode</AlertTitle>
          <AlertDescription>
            You're using the free demo version of Google Classroom integration.
            Sample data will be shown instead of real Google Classroom data.
            For production use, please add your Google Client ID to enable real Google Classroom access.
          </AlertDescription>
        </Alert>
      )}

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
                    <h3 className="font-medium">Click "Sign in with Google"</h3>
                    <p className="text-sm text-muted-foreground">
                      {hasGoogleClientId 
                        ? "Use your Google account credentials to connect"
                        : "Try the demo mode with sample data"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium">2</div>
                  <div>
                    <h3 className="font-medium">
                      {hasGoogleClientId ? "Grant access permissions" : "View sample classes"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {hasGoogleClientId
                        ? "Allow BlockWard to access your Google Classroom data"
                        : "Browse example class data in demo mode"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium">3</div>
                  <div>
                    <h3 className="font-medium">Select and import a class</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose which class to import into BlockWard
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium">4</div>
                  <div>
                    <h3 className="font-medium">Start managing your class</h3>
                    <p className="text-sm text-muted-foreground">
                      Use BlockWard features with your imported class data
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
