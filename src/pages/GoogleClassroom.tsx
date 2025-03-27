
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleClassroomIntegration } from "@/components/google-classroom/GoogleClassroomIntegration";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

interface ClientIdFormValues {
  clientId: string;
}

const GoogleClassroom = () => {
  const navigate = useNavigate();
  
  // Get Google Client ID from environment or localStorage
  const savedClientId = localStorage.getItem('google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const [googleClientId, setGoogleClientId] = useState(savedClientId);

  const form = useForm<ClientIdFormValues>({
    defaultValues: {
      clientId: savedClientId
    }
  });

  const onSubmit = (data: ClientIdFormValues) => {
    const newClientId = data.clientId.trim();
    setGoogleClientId(newClientId);
    localStorage.setItem('google_client_id', newClientId);
  };
  
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
          {!googleClientId && (
            <Card className="mb-6 border-purple-500/50 bg-purple-500/5 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  Set Up Google Classroom
                </CardTitle>
                <CardDescription>
                  You'll need a Google Client ID to connect to Google Classroom
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Client ID</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your Google Client ID" 
                              {...field} 
                              className="bg-white/5"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the Client ID from your Google Cloud Console
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Save Client ID</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          <GoogleClassroomIntegration clientId={googleClientId} />
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
                    <h3 className="font-medium">Create Google Cloud project</h3>
                    <p className="text-sm text-muted-foreground">
                      Go to the Google Cloud Console and create a new project
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium">2</div>
                  <div>
                    <h3 className="font-medium">Enable Google Classroom API</h3>
                    <p className="text-sm text-muted-foreground">
                      In your Google Cloud project, enable the Google Classroom API
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium">3</div>
                  <div>
                    <h3 className="font-medium">Create OAuth credentials</h3>
                    <p className="text-sm text-muted-foreground">
                      Create OAuth client ID for a Web Application
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium">4</div>
                  <div>
                    <h3 className="font-medium">Add authorized origins</h3>
                    <p className="text-sm text-muted-foreground">
                      Add your domain to JavaScript origins: <code className="bg-muted px-1 py-0.5 rounded text-xs">{window.location.origin}</code>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-medium">5</div>
                  <div>
                    <h3 className="font-medium">Connect your account</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your Client ID above and click "Connect with Google"
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md bg-blue-500/10 p-3 border border-blue-500/20">
                <p className="text-sm">
                  <span className="font-medium">Need help?</span> Check out the <a href="https://developers.google.com/classroom/guides/auth" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Google Classroom API documentation</a> for detailed setup instructions.
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
