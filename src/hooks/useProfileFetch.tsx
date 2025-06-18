
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileService, UserProfile } from "@/services/ProfileService";

export const useProfileFetch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    school: "",
    subject: "",
    avatarUrl: null
  });
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in again."
        });
        navigate('/auth');
        return;
      }
      
      if (!session) {
        console.log('No session found, redirecting to auth');
        navigate('/auth');
        return;
      }
      
      console.log('Session found, fetching profile for user:', session.user.id);
      
      const userRole = await ProfileService.getUserRole(session.user.id);
      console.log('User role:', userRole);
        
      if (userRole === 'teacher') {
        const teacherProfile = await ProfileService.fetchTeacherProfile(session.user.id);
        console.log('Teacher profile loaded:', teacherProfile);
        if (teacherProfile) {
          setProfile(teacherProfile);
        }
      } else {
        const studentProfile = await ProfileService.fetchStudentProfile(session.user.id);
        console.log('Student profile loaded:', studentProfile);
        if (studentProfile) {
          setProfile(studentProfile);
        }
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user profile: " + (error.message || "Unknown error")
      });
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return {
    profile,
    setProfile,
    profileLoading,
    refetchProfile: fetchUserProfile
  };
};
