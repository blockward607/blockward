
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useProfileData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [subject, setSubject] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
        
      if (userRole?.role === 'teacher') {
        const { data: profile, error } = await supabase
          .from('teacher_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (profile) {
          setFullName(profile.full_name || '');
          setSchool(profile.school || '');
          setSubject(profile.subject || '');
          setAvatarUrl(profile.avatar_url || null);
        }
      } else {
        const { data: profile, error } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (profile) {
          setFullName(profile.name || '');
          setSchool(profile.school || '');
          setAvatarUrl(profile.avatar_url || null);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user profile"
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
        
      if (userRole?.role === 'teacher') {
        const { error } = await supabase
          .from('teacher_profiles')
          .update({
            full_name: fullName,
            school: school,
            subject: subject,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString() // Convert Date to ISO string format
          })
          .eq('user_id', session.user.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('students')
          .update({
            name: fullName,
            school: school,
            avatar_url: avatarUrl
          })
          .eq('user_id', session.user.id);
          
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    fullName,
    setFullName,
    school,
    setSchool,
    subject, 
    setSubject,
    avatarUrl,
    handleAvatarChange,
    loading,
    profileLoading,
    handleSaveProfile
  };
};
