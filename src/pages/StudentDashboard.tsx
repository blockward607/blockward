
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { StudentInfoCard } from "@/components/student-dashboard/StudentInfoCard";
import { DemoBanner } from "@/components/student-dashboard/DemoBanner";
import { useStudentData } from "@/components/student-dashboard/hooks/useStudentData";
import type { Notification } from "@/types/notification";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";

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
        <h2 className="text-2xl font-bold">Announcements</h2>
        
        <AnnouncementList 
          announcements={announcements} 
          loading={loadingAnnouncements} 
          isTeacher={false}
          onAnnouncementDeleted={() => {}}
        />
      </div>
    </div>
  );
};

export default StudentDashboard;
