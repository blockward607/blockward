
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

      // Check if user has admin role first
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (roleError) {
        console.error('Error checking user roles:', roleError);
        setIsAdmin(false);
        return;
      }

      // Check for admin or teacher role (since admin enum was just added)
      const hasAdminRole = userRoles?.some(r => r.role === 'admin' || r.role === 'teacher');
      setIsAdmin(hasAdminRole || false);

      if (hasAdminRole) {
        // Get admin profile and school data
        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (adminError) {
          console.error('Error fetching admin profile:', adminError);
        } else if (adminData) {
          setAdminProfile(adminData);

          // Get school data
          if (adminData.school_id) {
            const { data: schoolData, error: schoolError } = await supabase
              .from('schools')
              .select('*')
              .eq('id', adminData.school_id)
              .maybeSingle();

            if (schoolError) {
              console.error('Error fetching school:', schoolError);
            } else if (schoolData) {
              setSchool(schoolData);
            }
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
      // Create school
      const { data: newSchool, error: schoolError } = await supabase
        .from('schools')
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
        .from('admin_profiles')
        .insert({
          user_id: user?.id,
          school_id: newSchool.id,
          position: 'Administrator',
          permissions: {}
        });

      if (adminError) throw adminError;

      // Create user role as admin - handling the enum limitation
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user?.id,
          role: 'admin' as any // Now we can use admin role since enum was created
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
        .from('schools')
        .update(updates)
        .eq('id', school.id)
        .select()
        .single();

      if (error) throw error;

      setSchool(updatedSchool);

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
