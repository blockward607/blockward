
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileService, UserProfile } from "@/services/ProfileService";

export const useProfileSave = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (profile: UserProfile) => {
    if (!profile.fullName.trim()) {
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
      console.log('Profile data:', profile);
      
      const userRole = await ProfileService.getUserRole(session.user.id);
        
      if (userRole === 'teacher') {
        await ProfileService.saveTeacherProfile(session.user.id, profile);
        console.log('Teacher profile updated successfully');
      } else {
        await ProfileService.saveStudentProfile(session.user.id, profile);
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
    loading,
    handleSaveProfile
  };
};
