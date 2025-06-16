
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdminProfile {
  id: string;
  user_id: string;
  school_id: string;
  full_name: string;
  position: string;
  permissions: any;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  contact_email?: string;
  domain?: string;
  address?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  settings: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useAdminData = () => {
  const { toast } = useToast();
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No session found');
      }

      const { data: adminData, error } = await supabase
        .from('admin_profiles')
        .select(`
          *,
          schools (*)
        `)
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        throw error;
      }

      if (adminData) {
        setAdminProfile(adminData);
        setSchool(adminData.schools);
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin data"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSchool = async (updates: Partial<School>) => {
    if (!school) return;

    try {
      const { error } = await supabase
        .from('schools')
        .update(updates)
        .eq('id', school.id);

      if (error) throw error;

      setSchool({ ...school, ...updates });
      
      toast({
        title: "Success",
        description: "School updated successfully"
      });

    } catch (error) {
      console.error('Error updating school:', error);
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Failed to update school"
      });
    }
  };

  const updateAdminProfile = async (updates: Partial<AdminProfile>) => {
    if (!adminProfile) return;

    try {
      const { error } = await supabase
        .from('admin_profiles')
        .update(updates)
        .eq('id', adminProfile.id);

      if (error) throw error;

      setAdminProfile({ ...adminProfile, ...updates });
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });

    } catch (error) {
      console.error('Error updating admin profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile"
      });
    }
  };

  return {
    adminProfile,
    school,
    loading,
    updateSchool,
    updateAdminProfile,
    refetch: loadAdminData
  };
};
