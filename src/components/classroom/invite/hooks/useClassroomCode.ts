
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseClassroomCodeProps {
  classroomId: string;
}

export const useClassroomCode = ({ classroomId }: UseClassroomCodeProps) => {
  const [classroomCode, setClassroomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch existing classroom code on mount
  useEffect(() => {
    const fetchExistingCode = async () => {
      if (!classroomId) return;
      
      try {
        setLoading(true);
        console.log("[useClassroomCode] Fetching existing code for classroom:", classroomId);
        
        // Check if there's an existing active code for this classroom
        const { data, error } = await supabase
          .from('classroom_codes')
          .select('code, expires_at, usage_count')
          .eq('classroom_id', classroomId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Check if the code is still valid
          const expiresAt = new Date(data[0].expires_at);
          const now = new Date();
          
          if (expiresAt > now) {
            console.log("[useClassroomCode] Found existing valid code:", data[0].code);
            setClassroomCode(data[0].code);
          } else {
            console.log("[useClassroomCode] Found expired code, will generate new one");
          }
        }
      } catch (err) {
        console.error("[useClassroomCode] Error fetching classroom code:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExistingCode();
  }, [classroomId]);

  // Generate a new classroom code using the database function
  const generateClassroomCode = useCallback(async () => {
    setLoading(true);
    try {
      console.log("[useClassroomCode] Generating new code for classroom:", classroomId);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }
      
      // Call the database function to create a new code
      const { data, error } = await supabase.rpc('create_classroom_code', {
        p_classroom_id: classroomId,
        p_created_by: session.user.id
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to generate classroom code');
      }
      
      console.log("[useClassroomCode] Code generated successfully:", data);
      setClassroomCode(data);
      
      toast({
        title: "Success",
        description: "New classroom code generated",
      });
      
      return data;
    } catch (error: any) {
      console.error("[useClassroomCode] Error generating code:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate classroom code",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [classroomId, toast]);

  // Function to get the full join URL
  const getJoinUrl = useCallback(() => {
    if (!classroomCode) return '';
    
    // Create a clean URL
    const currentHost = window.location.host;
    const cleanHost = currentHost.replace(/^lovable\./, '').replace(/^www\./, '');
    
    // Use blockward.app domain for production or the current cleaned domain for development
    const finalHost = process.env.NODE_ENV === 'production' ? 'blockward.app' : cleanHost;
    const protocol = window.location.protocol;
    
    // Generate the full URL with the classroom code
    return `${protocol}//${finalHost}/classes?code=${classroomCode}`;
  }, [classroomCode]);

  return {
    classroomCode,
    setClassroomCode,
    loading,
    generateClassroomCode,
    getJoinUrl,
  };
};
