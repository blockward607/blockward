
import { supabase } from "@/integrations/supabase/client";

export const StudentProfileService = {
  // Get student profile by user_id
  async getStudentProfile(userId: string) {
    return await supabase
      .from('students')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
  },
  
  // Create student profile
  async createStudentProfile(userId: string, name: string) {
    return await supabase
      .from('students')
      .insert([{
        user_id: userId,
        name: name || 'Student'
      }])
      .select()
      .single();
  },
  
  // Set user role
  async setUserRole(userId: string, role: string) {
    return await supabase
      .from('user_roles')
      .upsert([{
        user_id: userId,
        role: role
      }]);
  }
};
