
import { supabase } from "@/integrations/supabase/client";

export const AuthService = {
  // Check if a user role exists
  async checkUserRole(userId: string) {
    try {
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleCheckError && roleCheckError.code !== 'PGRST116') {
        console.error("Error checking role:", roleCheckError);
        return { error: roleCheckError };
      }

      return { data: existingRole };
    } catch (error) {
      console.error("Error in checkUserRole:", error);
      return { error };
    }
  },

  // Create a role for the user
  async createUserRole(userId: string, role: string) {
    try {
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ 
          user_id: userId, 
          role: role 
        }]);

      if (roleError) {
        console.error("Role assignment error:", roleError);
        return { error: roleError };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in createUserRole:", error);
      return { error };
    }
  },

  // Check if a wallet exists
  async checkUserWallet(userId: string) {
    try {
      const { data: existingWallet, error: walletCheckError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (walletCheckError && walletCheckError.code !== 'PGRST116') {
        console.error("Error checking wallet:", walletCheckError);
        return { error: walletCheckError };
      }

      return { data: existingWallet };
    } catch (error) {
      console.error("Error in checkUserWallet:", error);
      return { error };
    }
  },

  // Create a wallet for the user
  async createUserWallet(userId: string, role: string) {
    try {
      // Generate a random hex address client-side
      const randomAddress = `0x${Array.from({length: 40}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('')}`;
        
      const { error: walletError } = await supabase
        .from('wallets')
        .insert([{
          user_id: userId,
          address: randomAddress,
          type: role === 'student' ? 'user' : 'admin'
        }]);

      if (walletError) {
        console.error("Wallet creation error:", walletError);
        return { error: walletError };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in createUserWallet:", error);
      return { error };
    }
  },

  // Check teacher profile
  async checkTeacherProfile(userId: string) {
    try {
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        console.error("Error checking teacher profile:", profileCheckError);
        return { error: profileCheckError };
      }

      return { data: existingProfile };
    } catch (error) {
      console.error("Error in checkTeacherProfile:", error);
      return { error };
    }
  },

  // Create teacher profile
  async createTeacherProfile(userId: string) {
    try {
      const { error: profileError } = await supabase
        .from('teacher_profiles')
        .insert([{ user_id: userId }]);

      if (profileError) {
        console.error("Teacher profile error:", profileError);
        return { error: profileError };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in createTeacherProfile:", error);
      return { error };
    }
  },

  // Check student profile
  async checkStudentProfile(userId: string) {
    try {
      const { data: existingStudent, error: studentCheckError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
          
      if (studentCheckError && studentCheckError.code !== 'PGRST116') {
        console.error("Error checking student record:", studentCheckError);
        return { error: studentCheckError };
      }

      return { data: existingStudent };
    } catch (error) {
      console.error("Error in checkStudentProfile:", error);
      return { error };
    }
  },

  // Create student profile
  async createStudentProfile(userId: string, nameOrEmail: string) {
    try {
      // Use email as name if no other info available
      const studentName = nameOrEmail || 'Student';
      
      const { error: studentError } = await supabase
        .from('students')
        .insert([{ 
          user_id: userId,
          name: studentName
        }]);
          
      if (studentError) {
        console.error("Student profile error:", studentError);
        return { error: studentError };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in createStudentProfile:", error);
      return { error };
    }
  }
};
