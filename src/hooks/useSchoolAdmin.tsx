
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
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

export const useSchoolAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [school, setSchool] = useState<School | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Check if user is an admin using the function
      const { data: adminStatus, error: adminError } = await supabase.rpc('is_school_admin');
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
        setIsAdmin(false);
      } else {
        setIsAdmin(adminStatus || false);

        if (adminStatus) {
          // Get school data for this admin using a direct query
          const { data: schoolData, error: schoolError } = await supabase
            .from('admin_profiles' as any)
            .select(`
              *,
              schools:school_id (*)
            `)
            .eq('user_id', user.id)
            .single();

          if (schoolError) {
            console.error('Error fetching school:', schoolError);
          } else if (schoolData?.schools) {
            setSchool(schoolData.schools as School);
            setAdminProfile(schoolData as AdminProfile);
          }
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check admin status"
      });
    } finally {
      setLoading(false);
    }
  };

  const createSchool = async (schoolData: Partial<School>) => {
    try {
      // Create school using direct SQL
      const { data: newSchool, error: schoolError } = await supabase
        .from('schools' as any)
        .insert({
          name: schoolData.name,
          contact_email: schoolData.contact_email,
          domain: schoolData.domain,
          address: schoolData.address,
          phone: schoolData.phone,
          website: schoolData.website,
          settings: schoolData.settings || {},
          created_by: user?.id
        })
        .select()
        .single();

      if (schoolError) throw schoolError;
      
      // Create admin profile for current user
      const { error: adminError } = await supabase
        .from('admin_profiles' as any)
        .insert({
          user_id: user?.id,
          school_id: newSchool.id,
          position: 'Administrator',
          permissions: {}
        });

      if (adminError) throw adminError;

      // Create user role as admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user?.id,
          role: 'admin'
        });

      if (roleError) {
        console.error('Error creating admin role:', roleError);
        // Continue anyway as this might be handled by triggers
      }

      setSchool(newSchool);
      setIsAdmin(true);

      toast({
        title: "Success",
        description: "School created successfully"
      });

      return newSchool;
    } catch (error) {
      console.error('Error creating school:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create school"
      });
      throw error;
    }
  };

  const updateSchool = async (updates: Partial<School>) => {
    if (!school) return;

    try {
      const { data: updatedSchool, error } = await supabase
        .from('schools' as any)
        .update(updates)
        .eq('id', school.id)
        .select()
        .single();

      if (error) throw error;

      setSchool(updatedSchool);

      // Log the action using the function
      await supabase.rpc('log_admin_action', {
        p_school_id: school.id,
        p_action: 'SCHOOL_UPDATED',
        p_entity_type: 'school',
        p_entity_id: school.id,
        p_details: { updates }
      });

      toast({
        title: "Success",
        description: "School updated successfully"
      });

      return updatedSchool;
    } catch (error) {
      console.error('Error updating school:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update school"
      });
      throw error;
    }
  };

  return {
    school,
    adminProfile,
    isAdmin,
    loading,
    createSchool,
    updateSchool,
    checkAdminStatus
  };
};
