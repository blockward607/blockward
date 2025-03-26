
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleClassroomIntegration } from "@/components/google-classroom/GoogleClassroomIntegration";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const GoogleClassroom = () => {
  const navigate = useNavigate();
  
  // Replace this with your actual Google Client ID
  // In production, this should come from environment variables
  const [googleClientId, setGoogleClientId] = useState(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || ""
  );
  
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
          {!googleClientId && (
            <Card className="mb-6 border-orange-500/50 bg-orange-500/10">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Google Client ID Required</h3>
                <p className="text-sm text-gray-400 mb-4">
                  To use Google Classroom integration, you need to set up a Google Cloud project and obtain a Client ID.
                  Follow the guide in the right panel to set this up.
                </p>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="clientId" className="text-sm font-medium">
                    Enter your Google Client ID:
                  </label>
                  <input
                    id="clientId"
                    type="text"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="Your Google Client ID"
                    className="w-full p-2 border rounded-md bg-black/40 border-gray-700"
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
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
                <h3 className="font-medium mb-1">Step 1: Create Google Cloud Project</h3>
                <p className="text-sm text-gray-400">Create a project in Google Cloud Console and enable the Google Classroom API.</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Step 2: Set Up OAuth Credentials</h3>
                <p className="text-sm text-gray-400">
                  Create OAuth credentials and add your domain to authorized origins. 
                  Add <code className="bg-gray-800 px-1 rounded text-xs">https://your-domain.com</code> to authorized JavaScript origins.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Step 3: Add Client ID</h3>
                <p className="text-sm text-gray-400">Copy your Client ID from Google Cloud Console and paste it in the input field.</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Step 4: Connect Account</h3>
                <p className="text-sm text-gray-400">Click "Connect Google Classroom" and authorize BlockWard to access your Google Classroom data.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoogleClassroom;
