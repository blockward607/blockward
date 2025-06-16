
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SecurityService } from '@/services/SecurityService';

export const useSecureQueries = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const secureQuery = useCallback(async (queryFn: () => Promise<any>) => {
    try {
      setLoading(true);
      return await queryFn();
    } catch (error) {
      console.error('Secure query error:', error);
      SecurityService.logSecurityEvent('query_error', { error: error.message });
      toast({
        variant: "destructive",
        title: "Security Error",
        description: "Invalid request detected"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const secureStudentQuery = useCallback(async (studentId: string) => {
    if (!SecurityService.isValidUUID(studentId)) {
      throw new Error('Invalid student ID format');
    }

    return secureQuery(async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, points, school')
        .eq('id', studentId)
        .maybeSingle();

      if (error) throw error;
      return data;
    });
  }, [secureQuery]);

  const secureClassroomQuery = useCallback(async (classroomId: string) => {
    if (!SecurityService.isValidUUID(classroomId)) {
      throw new Error('Invalid classroom ID format');
    }

    return secureQuery(async () => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('id, name, description, teacher_id')
        .eq('id', classroomId)
        .maybeSingle();

      if (error) throw error;
      return data;
    });
  }, [secureQuery]);

  return {
    loading,
    secureQuery,
    secureStudentQuery,
    secureClassroomQuery
  };
};
