
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleClassroomIntegration } from "@/components/google-classroom/GoogleClassroomIntegration";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GoogleClassroom = () => {
  const navigate = useNavigate();
  
  // This client ID should be configured in your environment variables
  // or fetched from your backend in a real application
  const googleClientId = "YOUR_GOOGLE_CLIENT_ID"; // Replace with actual client ID or env variable
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/classes')} className="mr-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Classes
        </Button>
        <h1 className="text-3xl font-bold">Google Classroom Integration</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GoogleClassroomIntegration clientId={googleClientId} />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
              <CardDescription>How to connect Google Classroom</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Step 1: Connect Your Account</h3>
                <p className="text-sm text-gray-400">Click the "Connect Google Classroom" button to authorize BlockWard to access your Google Classroom data.</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Step 2: Select Classes</h3>
                <p className="text-sm text-gray-400">Choose which classes you want to import into BlockWard.</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Step 3: Import Students</h3>
                <p className="text-sm text-gray-400">Import students from your Google Classroom into BlockWard for seamless management.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoogleClassroom;
