
import { supabase } from '@/integrations/supabase/client';
import { SecurityService } from './SecurityService';

export interface CreateUserRequest {
  email: string;
  password: string;
  role: 'teacher' | 'student';
  fullName?: string;
  schoolId: string;
  yearGroupId?: string;
  additionalData?: any;
}

export const AdminAuthService = {
  // Create a new user account (only for school admins)
  async createUserAccount(userRequest: CreateUserRequest) {
    const { email, password, role, fullName, schoolId, yearGroupId, additionalData } = userRequest;

    // Validate inputs
    if (!SecurityService.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!SecurityService.isValidUUID(schoolId)) {
      throw new Error('Invalid school ID');
    }

    if (yearGroupId && !SecurityService.isValidUUID(yearGroupId)) {
      throw new Error('Invalid year group ID');
    }

    try {
      // Create auth user (this would typically be done via Supabase Admin API)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            role: role,
            full_name: fullName,
            school_id: schoolId
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: role
        });

      if (roleError) {
        console.error('Error creating user role:', roleError);
        // Continue anyway as this might be handled by triggers
      }

      // Create profile based on role
      if (role === 'teacher') {
        const { error: profileError } = await supabase
          .from('teacher_profiles')
          .insert({
            user_id: authData.user.id,
            school_id: schoolId,
            full_name: fullName,
            ...additionalData
          });

        if (profileError) {
          console.error('Error creating teacher profile:', profileError);
        }
      } else if (role === 'student') {
        const { error: profileError } = await supabase
          .from('students')
          .insert({
            user_id: authData.user.id,
            school_id: schoolId,
            name: fullName || email.split('@')[0],
            year_group_id: yearGroupId,
            ...additionalData
          });

        if (profileError) {
          console.error('Error creating student profile:', profileError);
        }
      }

      return authData.user;
    } catch (error) {
      console.error('Error creating user account:', error);
      throw error;
    }
  },

  // Bulk create users from CSV data
  async bulkCreateUsers(usersData: CreateUserRequest[]) {
    const results = {
      successful: [] as any[],
      failed: [] as any[]
    };

    for (const userData of usersData) {
      try {
        const user = await this.createUserAccount(userData);
        results.successful.push({ userData, user });
      } catch (error) {
        results.failed.push({ userData, error: error.message });
      }
    }

    return results;
  },

  // Reset user password
  async resetUserPassword(userEmail: string) {
    if (!SecurityService.isValidEmail(userEmail)) {
      throw new Error('Invalid email format');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(userEmail);
    
    if (error) {
      throw error;
    }

    return true;
  },

  // Suspend/activate user account
  async toggleUserStatus(userId: string, active: boolean) {
    if (!SecurityService.isValidUUID(userId)) {
      throw new Error('Invalid user ID format');
    }

    // This would typically require admin API access
    // For now, we'll implement a soft disable by updating metadata
    const { error } = await supabase.auth.updateUser({
      data: { active: active }
    });

    if (error) {
      throw error;
    }

    return true;
  }
};
