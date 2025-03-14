
import { supabase } from '@/integrations/supabase/client';

export const AuthService = {
  
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
  },
  
  // Check if a wallet exists
  checkUserWallet: async (userId: string) => {
    console.log('Checking wallet for user:', userId);
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error && !error.message.includes('No rows found')) {
      console.error('Error checking user wallet:', error);
      throw error;
    }
    
    return { data, error };
  },
  
  // Create a user wallet
  createUserWallet: async (userId: string, type: 'user' | 'admin', address: string) => {
    console.log('Creating wallet:', { userId, type, address });
    const { data, error } = await supabase
      .from('wallets')
      .insert({ 
        user_id: userId, 
        type,
        address
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user wallet:', error);
      throw error;
    }
    
    console.log('Wallet created successfully:', data);
    return { data, error };
  },
  
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
  createTeacherProfile: async (userId: string, school?: string, subject?: string) => {
    console.log('Creating teacher profile for:', userId);
    const { data, error } = await supabase
      .from('teacher_profiles')
      .insert({ 
        user_id: userId,
        school: school || '',
        subject: subject || '',
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
  },

  // Generate a unique class code for teacher
  generateClassCode: async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
};
