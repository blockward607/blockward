
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
      
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      if (roleError) {
        console.error('Error fetching user role:', roleError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user role"
        });
        return;
      }
        
      console.log('User role:', userRole);
        
      if (userRole?.role === 'teacher') {
        const { data: profile, error } = await supabase
          .from('teacher_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching teacher profile:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load teacher profile"
          });
        } else {
          console.log('Teacher profile loaded:', profile);
          if (profile) {
            setFullName(profile.full_name || '');
            setSchool(profile.school || '');
            setSubject(profile.subject || '');
            setAvatarUrl(profile.avatar_url || null);
          }
        }
      } else {
        const { data: profile, error } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching student profile:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load student profile"
          });
        } else {
          console.log('Student profile loaded:', profile);
          if (profile) {
            setFullName(profile.name || '');
            setSchool(profile.school || '');
            setAvatarUrl(null); // Students don't have avatar_url in the current schema
          }
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

  const handleAvatarChange = (url: string) => {
    console.log('Avatar changed to:', url);
    setAvatarUrl(url);
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Full name is required"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in again."
        });
        navigate('/auth');
        return;
      }
      
      console.log('Saving profile for user:', session.user.id);
      console.log('Profile data:', { fullName, school, subject, avatarUrl });
      
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      if (roleError) {
        console.error('Error fetching user role:', roleError);
        throw new Error('Failed to determine user role');
      }
        
      if (userRole?.role === 'teacher') {
        const { error } = await supabase
          .from('teacher_profiles')
          .upsert({
            user_id: session.user.id,
            full_name: fullName.trim(),
            school: school.trim() || null,
            subject: subject.trim() || null,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'user_id'
          });
          
        if (error) {
          console.error('Teacher profile update error:', error);
          throw new Error(`Failed to update teacher profile: ${error.message}`);
        }
        console.log('Teacher profile updated successfully');
      } else {
        const { error } = await supabase
          .from('students')
          .upsert({
            user_id: session.user.id,
            name: fullName.trim(),
            school: school.trim() || null
          }, { 
            onConflict: 'user_id'
          });
          
        if (error) {
          console.error('Student profile update error:', error);
          throw new Error(`Failed to update student profile: ${error.message}`);
        }
        console.log('Student profile updated successfully');
      }
      
      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error.message || "Failed to update profile. Please try again."
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
