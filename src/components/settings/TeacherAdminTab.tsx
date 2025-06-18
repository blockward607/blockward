
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, School, BarChart3, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const TeacherAdminTab = () => {
  const { toast } = useToast();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasAdminRequest, setHasAdminRequest] = useState(false);
  const [schoolCode, setSchoolCode] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    checkAdminRequest();
  }, [user]);

  const checkAdminRequest = async () => {
    if (!user) return;
    
    try {
      // Check if teacher has pending admin request using type assertion
      const { data } = await (supabase as any)
        .from('admin_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();
        
      setHasAdminRequest(!!data);
    } catch (error) {
      console.error('Error checking admin request:', error);
    }
  };

  const handleRequestAdminAccess = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('admin_requests')
        .insert({
          user_id: user.id,
          school_code: schoolCode,
          message: requestMessage,
          status: 'pending'
        });

      if (error) throw error;

      setHasAdminRequest(true);
      toast({
        title: "Admin Request Submitted",
        description: "Your request for admin access has been submitted for review."
      });
    } catch (error) {
      console.error('Error submitting admin request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit admin request. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccessAdminPortal = () => {
    navigate('/admin');
  };

  const adminFeatures = [
    {
      title: "User Management",
      description: "Manage teachers and students",
      icon: Users,
      action: () => navigate('/admin/users'),
      color: "bg-blue-500"
    },
    {
      title: "School Settings",
      description: "Configure school information",
      icon: School,
      action: () => navigate('/admin/settings'),
      color: "bg-green-500"
    },
    {
      title: "Analytics",
      description: "View school performance metrics",
      icon: BarChart3,
      action: () => navigate('/admin/analytics'),
      color: "bg-purple-500"
    },
    {
      title: "Announcements",
      description: "Send school-wide announcements",
      icon: Mail,
      action: () => navigate('/admin/announcements'),
      color: "bg-orange-500"
    }
  ];

  if (userRole === 'admin') {
    return (
      <div className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Admin Access Granted</span>
            </CardTitle>
            <CardDescription>You have full administrative privileges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleAccessAdminPortal}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Access Admin Portal
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${feature.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white group-hover:text-purple-300 transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={feature.action}
                    variant="outline"
                    className="w-full border-gray-600 text-white hover:bg-gray-700"
                  >
                    Access
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <Shield className="w-5 h-5 text-yellow-400" />
            <span>Request Admin Access</span>
          </CardTitle>
          <CardDescription>
            Request administrative privileges to manage school settings and users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasAdminRequest ? (
            <div className="text-center py-8">
              <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Request Pending</h3>
              <p className="text-gray-400">
                Your admin access request is being reviewed. You'll be notified once it's approved.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="schoolCode" className="text-white">School Code (Optional)</Label>
                <Input
                  id="schoolCode"
                  placeholder="Enter your school's admin code"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestMessage" className="text-white">Reason for Request</Label>
                <textarea
                  id="requestMessage"
                  placeholder="Explain why you need admin access..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 resize-none"
                />
              </div>
              <Button
                onClick={handleRequestAdminAccess}
                disabled={loading || !requestMessage.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? "Submitting..." : "Request Admin Access"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Admin Features Preview</CardTitle>
          <CardDescription>
            Features you'll have access to with admin privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className={`p-2 rounded-lg ${feature.color} opacity-60`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{feature.title}</p>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAdminTab;
