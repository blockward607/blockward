
import { supabase } from '@/integrations/supabase/client';

export interface School {
  id: string;
  name: string;
  contact_email?: string;
  logo_url?: string;
  domain?: string;
  address?: string;
  phone?: string;
  website?: string;
  settings: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile {
  id: string;
  user_id: string;
  school_id: string;
  full_name?: string;
  position?: string;
  permissions: any;
  created_at: string;
  updated_at: string;
}

export interface YearGroup {
  id: string;
  school_id: string;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code?: string;
  description?: string;
  color?: string;
  created_at: string;
}

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const SchoolAdminService = {
  // School Management
  async createSchool(schoolData: Partial<School>) {
    const sanitizedData = {
      name: sanitizeInput(schoolData.name || ''),
      contact_email: schoolData.contact_email ? sanitizeInput(schoolData.contact_email) : null,
      domain: schoolData.domain ? sanitizeInput(schoolData.domain) : null,
      address: schoolData.address ? sanitizeInput(schoolData.address) : null,
      phone: schoolData.phone ? sanitizeInput(schoolData.phone) : null,
      website: schoolData.website ? sanitizeInput(schoolData.website) : null,
      settings: schoolData.settings || {}
    };

    const { data, error } = await supabase
      .from('schools' as any)
      .insert(sanitizedData)
      .select()
      .single();

    if (error) {
      console.error('Error creating school:', error);
      throw error;
    }

    return data;
  },

  async getSchoolByAdmin(userId: string) {
    if (!isValidUUID(userId)) {
      throw new Error('Invalid user ID format');
    }

    const { data, error } = await supabase
      .from('admin_profiles' as any)
      .select(`
        *,
        schools:school_id (*)
      `)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching school by admin:', error);
      throw error;
    }

    return data?.schools || null;
  },

  async updateSchool(schoolId: string, updates: Partial<School>) {
    if (!isValidUUID(schoolId)) {
      throw new Error('Invalid school ID format');
    }

    const sanitizedUpdates = {
      ...updates,
      name: updates.name ? sanitizeInput(updates.name) : undefined,
      contact_email: updates.contact_email ? sanitizeInput(updates.contact_email) : undefined
    };

    const { data, error } = await supabase
      .from('schools' as any)
      .update(sanitizedUpdates)
      .eq('id', schoolId)
      .select()
      .single();

    if (error) {
      console.error('Error updating school:', error);
      throw error;
    }

    return data;
  },

  // Year Groups Management
  async createYearGroup(yearGroupData: Partial<YearGroup>) {
    const sanitizedData = {
      school_id: yearGroupData.school_id,
      name: sanitizeInput(yearGroupData.name || ''),
      description: yearGroupData.description ? sanitizeInput(yearGroupData.description) : null,
      sort_order: yearGroupData.sort_order || 0
    };

    const { data, error } = await supabase
      .from('year_groups' as any)
      .insert(sanitizedData)
      .select()
      .single();

    if (error) {
      console.error('Error creating year group:', error);
      throw error;
    }

    return data;
  },

  async getYearGroups(schoolId: string) {
    if (!isValidUUID(schoolId)) {
      throw new Error('Invalid school ID format');
    }

    const { data, error } = await supabase
      .from('year_groups' as any)
      .select('*')
      .eq('school_id', schoolId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching year groups:', error);
      throw error;
    }

    return data || [];
  },

  // Subjects Management
  async createSubject(subjectData: Partial<Subject>) {
    const sanitizedData = {
      school_id: subjectData.school_id,
      name: sanitizeInput(subjectData.name || ''),
      code: subjectData.code ? sanitizeInput(subjectData.code) : null,
      description: subjectData.description ? sanitizeInput(subjectData.description) : null,
      color: subjectData.color ? sanitizeInput(subjectData.color) : null
    };

    const { data, error } = await supabase
      .from('subjects' as any)
      .insert(sanitizedData)
      .select()
      .single();

    if (error) {
      console.error('Error creating subject:', error);
      throw error;
    }

    return data;
  },

  async getSubjects(schoolId: string) {
    if (!isValidUUID(schoolId)) {
      throw new Error('Invalid school ID format');
    }

    const { data, error } = await supabase
      .from('subjects' as any)
      .select('*')
      .eq('school_id', schoolId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }

    return data || [];
  },

  // Admin Profile Management
  async createAdminProfile(adminData: Partial<AdminProfile>) {
    const sanitizedData = {
      user_id: adminData.user_id,
      school_id: adminData.school_id,
      full_name: adminData.full_name ? sanitizeInput(adminData.full_name) : null,
      position: adminData.position ? sanitizeInput(adminData.position) : null,
      permissions: adminData.permissions || {}
    };

    const { data, error } = await supabase
      .from('admin_profiles' as any)
      .insert(sanitizedData)
      .select()
      .single();

    if (error) {
      console.error('Error creating admin profile:', error);
      throw error;
    }

    return data;
  },

  async isSchoolAdmin(userId: string, schoolId?: string) {
    if (!isValidUUID(userId)) {
      return false;
    }

    const { data, error } = await supabase.rpc('is_school_admin', {
      p_school_id: schoolId || null
    });

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data;
  },

  // Audit Logging
  async logAdminAction(
    schoolId: string,
    action: string,
    entityType?: string,
    entityId?: string,
    details?: any
  ) {
    if (!isValidUUID(schoolId)) {
      throw new Error('Invalid school ID format');
    }

    const { data, error } = await supabase.rpc('log_admin_action', {
      p_school_id: schoolId,
      p_action: sanitizeInput(action),
      p_entity_type: entityType ? sanitizeInput(entityType) : null,
      p_entity_id: entityId || null,
      p_details: details || {}
    });

    if (error) {
      console.error('Error logging admin action:', error);
      throw error;
    }

    return data;
  },

  async getAuditLogs(schoolId: string, limit: number = 50) {
    if (!isValidUUID(schoolId)) {
      throw new Error('Invalid school ID format');
    }

    const { data, error } = await supabase
      .from('audit_logs' as any)
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }

    return data || [];
  }
};
