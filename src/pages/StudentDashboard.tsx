
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { StudentInfoCard } from "@/components/student-dashboard/StudentInfoCard";
import { DemoBanner } from "@/components/student-dashboard/DemoBanner";
import { useStudentData } from "@/components/student-dashboard/hooks/useStudentData";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";

type Notification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  classroom_id?: string | null;
  type?: string;
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { loading, studentData } = useStudentData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [announcements, setAnnouncements] = useState<Notification[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [enrolledClassrooms, setEnrolledClassrooms] = useState<string[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        // Demo mode is enabled if we're in the view route or no authenticated session
        const isDemoMode = window.location.pathname.includes('view-student') || !session;
        setIsDemo(isDemoMode);

        if (session && studentData?.id) {
          // Fetch enrolled classrooms for the student
          const { data: enrollments, error: enrollmentError } = await supabase
            .from('classroom_students')
            .select('classroom_id')
            .eq('student_id', studentData.id);
          
          if (enrollmentError) {
            console.error('Error fetching student enrollments:', enrollmentError);
          } else if (enrollments && enrollments.length > 0) {
            setEnrolledClassrooms(enrollments.map(e => e.classroom_id));
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
        setIsDemo(true);
      }
    };
    
    checkAuth();
  }, [studentData]);

  useEffect(() => {
    if (!isDemo && studentData?.id) {
      fetchAnnouncements();
    } else {
      setLoadingAnnouncements(false);
    }
  }, [isDemo, studentData, enrolledClassrooms]);

  const fetchAnnouncements = async () => {
    try {
      if (!studentData) {
        console.log('No student data, skipping announcements');
        setAnnouncements([]);
        return;
      }
      
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('type', 'announcement')
        .order('created_at', { ascending: false });
      
      // If enrolled in classes, fetch announcements for those classes or global announcements
      if (enrolledClassrooms.length > 0) {
        query = query.or(`classroom_id.is.null,classroom_id.in.(${enrolledClassrooms.join(',')})`);
      } else {
        // Only global announcements if not enrolled in any classes
        query = query.is('classroom_id', null);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching student announcements:', error);
        throw error;
      }
      
      console.log(`Loaded ${data?.length || 0} announcements for student`);
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
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
        <div className="p-4">Loading student dashboard...</div>
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
          onAnnouncementDeleted={() => fetchAnnouncements()}
        />
      </div>
    </div>
  );
};

export default StudentDashboard;
