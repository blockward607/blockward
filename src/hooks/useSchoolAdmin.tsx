
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { SchoolAdminService, School, AdminProfile } from '@/services/SchoolAdminService';
import { useToast } from '@/hooks/use-toast';

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

      // Check if user is an admin
      const adminStatus = await SchoolAdminService.isSchoolAdmin(user.id);
      setIsAdmin(adminStatus);

      if (adminStatus) {
        // Get school data for this admin
        const schoolData = await SchoolAdminService.getSchoolByAdmin(user.id);
        setSchool(schoolData);
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
      const newSchool = await SchoolAdminService.createSchool(schoolData);
      
      // Create admin profile for current user
      await SchoolAdminService.createAdminProfile({
        user_id: user?.id,
        school_id: newSchool.id,
        position: 'Administrator'
      });

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
      const updatedSchool = await SchoolAdminService.updateSchool(school.id, updates);
      setSchool(updatedSchool);

      // Log the action
      await SchoolAdminService.logAdminAction(
        school.id,
        'SCHOOL_UPDATED',
        'school',
        school.id,
        { updates }
      );

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
