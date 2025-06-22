
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
    // Create a default school if needed
    const { data: defaultSchool, error: schoolError } = await supabase
      .from('schools')
      .insert({
        name: 'Default School',
        contact_email: 'admin@school.edu',
        institution_code: Math.random().toString(36).substring(2, 8).toUpperCase()
      })
      .select()
      .single();
    
    if (schoolError) {
      console.error('Error creating default school:', schoolError);
      throw new Error('Failed to create school profile');
    }

    return await supabase
      .from('students')
      .insert({
        user_id: userId,
        name: name || 'Student',
        school_id: defaultSchool.id
      })
      .select()
      .single();
  },
  
  // Set user role
  async setUserRole(userId: string, role: 'teacher' | 'student') {
    return await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role
      });
  }
};
