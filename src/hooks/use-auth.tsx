
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
      // For Google auth, we need to determine the role differently
      // Check if we have role in user metadata, otherwise assume 'student'
      let userRole;
      
      if (session.user.app_metadata?.provider === 'google') {
        // If coming from Google, check if a role was passed in the OAuth options
        userRole = session.user.user_metadata?.role || 'student';
      } else {
        // Regular email login
        userRole = session.user.user_metadata?.role as 'teacher' | 'student';
      }
      
      // Check if role exists
      const { data: existingRole } = await AuthService.checkUserRole(userId);
      
      if (!existingRole) {
        // Create role
        await AuthService.createUserRole(userId, userRole);
      }
      
      // Check if wallet exists
      const { data: existingWallet } = await AuthService.checkUserWallet(userId);
      
      if (!existingWallet) {
        // Create wallet based on role
        const walletType = userRole === 'teacher' ? 'admin' : 'user';
        const walletAddress = `wallet_${Math.random().toString(16).slice(2, 10)}`;
        
        // Create wallet
        await AuthService.createUserWallet(userId, walletType, walletAddress);
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
          const name = session.user.user_metadata?.name || session.user.user_metadata?.full_name || email.split('@')[0];
          await AuthService.createStudentProfile(userId, email, name);
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
