import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/AuthService';

export function useAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const setupUserAccount = useCallback(async (session) => {
    if (!session) return;
    
    try {
      const userId = session.user.id;
      const userRole = session.user.user_metadata.role as 'teacher' | 'student';
      
      // Check if role exists
      const { data: existingRole } = await AuthService.checkUserRole(userId);
      
      if (!existingRole) {
        // Create role
        await AuthService.createUserRole(userId, userRole);
      }
      
      // Check if wallet exists
      const { data: existingWallet } = await AuthService.checkUserWallet(userId);
      
      if (!existingWallet) {
        // Create wallet
        await AuthService.createUserWallet(userId, userRole);
      }
      
      // Create profile based on role
      if (userRole === 'teacher') {
        const { data: existingProfile } = await AuthService.checkTeacherProfile(userId);
        
        if (!existingProfile) {
          await AuthService.createTeacherProfile(userId);
        }
      } else {
        // For students
        const { data: existingStudent } = await AuthService.checkStudentProfile(userId);
        
        if (!existingStudent) {
          const email = session.user.email;
          await AuthService.createStudentProfile(userId, email);
        }
      }
      
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Unexpected error during account setup:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong during account setup. Please try again.",
      });
    }
  }, [navigate, toast]);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        await setupUserAccount(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, setupUserAccount]);

  return { loading, setLoading };
}
