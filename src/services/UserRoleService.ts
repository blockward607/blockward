
import { supabase } from '@/integrations/supabase/client';

export const UserRoleService = {
  // Check if a user role exists
  checkUserRole: async (userId: string) => {
    console.log('Checking user role for:', userId);
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error && !error.message.includes('No rows found')) {
      console.error('Error checking user role:', error);
      throw error;
    }
    
    return { data, error };
  },
  
  // Create a user role
  createUserRole: async (userId: string, role: 'teacher' | 'student') => {
    console.log('Creating user role:', { userId, role });
    const { data, error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user role:', error);
      throw error;
    }
    
    console.log('User role created successfully:', data);
    return { data, error };
  }
};
