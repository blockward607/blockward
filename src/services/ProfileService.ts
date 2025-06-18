
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  fullName: string;
  school: string;
  subject: string;
  avatarUrl: string | null;
}

export const ProfileService = {
  async getUserRole(userId: string) {
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching user role:', error);
      throw error;
    }
    
    return userRole?.role;
  },

  async fetchTeacherProfile(userId: string): Promise<UserProfile | null> {
    const { data: profile, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching teacher profile:', error);
      throw error;
    }
    
    if (!profile) return null;
    
    return {
      fullName: profile.full_name || '',
      school: profile.school || '',
      subject: profile.subject || '',
      avatarUrl: profile.avatar_url || null
    };
  },

  async fetchStudentProfile(userId: string): Promise<UserProfile | null> {
    const { data: profile, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching student profile:', error);
      throw error;
    }
    
    if (!profile) return null;
    
    return {
      fullName: profile.name || '',
      school: profile.school || '',
      subject: '',
      avatarUrl: null
    };
  },

  async saveTeacherProfile(userId: string, profile: UserProfile) {
    const { error } = await supabase
      .from('teacher_profiles')
      .upsert({
        user_id: userId,
        full_name: profile.fullName.trim(),
        school: profile.school.trim() || null,
        subject: profile.subject.trim() || null,
        avatar_url: profile.avatarUrl,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id'
      });
      
    if (error) {
      console.error('Teacher profile update error:', error);
      throw new Error(`Failed to update teacher profile: ${error.message}`);
    }
  },

  async saveStudentProfile(userId: string, profile: UserProfile) {
    const { error } = await supabase
      .from('students')
      .upsert({
        user_id: userId,
        name: profile.fullName.trim(),
        school: profile.school.trim() || null
      }, { 
        onConflict: 'user_id'
      });
      
    if (error) {
      console.error('Student profile update error:', error);
      throw new Error(`Failed to update student profile: ${error.message}`);
    }
  }
};
