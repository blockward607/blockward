
import { supabase } from '@/integrations/supabase/client';

export const ProfileService = {
  // Check if a teacher profile exists
  checkTeacherProfile: async (userId: string) => {
    console.log('Checking teacher profile for:', userId);
    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error && !error.message.includes('No rows found')) {
      console.error('Error checking teacher profile:', error);
      throw error;
    }
    
    return { data, error };
  },
  
  // Create a teacher profile
  createTeacherProfile: async (userId: string, school?: string, subject?: string, fullName?: string) => {
    console.log('Creating teacher profile for:', userId);
    const { data, error } = await supabase
      .from('teacher_profiles')
      .insert({ 
        user_id: userId,
        school: school || '',
        subject: subject || '',
        full_name: fullName || '',
        remaining_credits: 1000
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating teacher profile:', error);
      throw error;
    }
    
    console.log('Teacher profile created successfully:', data);
    return { data, error };
  },
  
  // Check if a student profile exists
  checkStudentProfile: async (userId: string) => {
    console.log('Checking student profile for:', userId);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error && !error.message.includes('No rows found')) {
      console.error('Error checking student profile:', error);
      throw error;
    }
    
    return { data, error };
  },
  
  // Create a student profile
  createStudentProfile: async (userId: string, email: string, name?: string, school?: string) => {
    const username = name || email.split('@')[0];
    console.log('Creating student profile:', { userId, username, school });
    
    const { data, error } = await supabase
      .from('students')
      .insert({
        user_id: userId,
        name: username,
        school: school || '',
        points: 0
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating student profile:', error);
      throw error;
    }
    
    console.log('Student profile created successfully:', data);
    return { data, error };
  }
};
