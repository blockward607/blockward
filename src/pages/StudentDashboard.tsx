
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { StudentInfoCard } from "@/components/student-dashboard/StudentInfoCard";
import { DemoBanner } from "@/components/student-dashboard/DemoBanner";
import { useStudentData } from "@/components/student-dashboard/hooks/useStudentData";
import type { Notification } from "@/types/notification";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { loading, studentData } = useStudentData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [announcements, setAnnouncements] = useState<Notification[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      // Demo mode is enabled if we're in the view route or no authenticated session
      const isDemoMode = window.location.pathname.includes('view-student') || !session;
      setIsDemo(isDemoMode);
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isDemo) {
      fetchAnnouncements();
    }
  }, [isDemo]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'announcement')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleSignUp = () => {
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Info */}
      <StudentInfoCard 
        studentName={studentData?.name || "Guest Student"} 
        studentEmail={null} 
        studentPoints={studentData?.points || 0} 
      />

      {/* Demo Banner (only shown in demo mode) */}
      {isDemo && <DemoBanner onSignUp={handleSignUp} />}

      {/* Announcements Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Announcements</h2>
        
        {loadingAnnouncements ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : announcements.length === 0 ? (
          <Card className="p-6 text-center bg-black/50 border-purple-500/20">
            <p className="text-gray-400">No announcements yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="p-6 bg-black/50 border-purple-500/30">
                <h3 className="text-xl font-bold mb-2">{announcement.title}</h3>
                <p className="text-gray-300 mb-4">{announcement.message}</p>
                <div className="text-sm text-gray-400">
                  Posted on {new Date(announcement.created_at).toLocaleDateString()} at {new Date(announcement.created_at).toLocaleTimeString()}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
