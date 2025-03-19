
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAccountSetup } from './use-account-setup';
import { useAuthContext } from '@/contexts/AuthContext';

export function useAuthState() {
  const navigate = useNavigate();
  const { user, setUser, userRole, setUserRole } = useAuthContext();
  const { setupUserAccount } = useAccountSetup();

  const initializeAuth = useCallback(async () => {
    try {
      // Check if user is already logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        
        // Get the user role
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
          
        if (data) {
          setUserRole(data.role);
        }
        
        console.log('Found existing session, navigating to dashboard');
        
        // Don't automatically navigate to dashboard if we're already on another page
        const currentPath = window.location.pathname;
        if (currentPath === '/' || currentPath === '/auth') {
          navigate('/dashboard');
        }
      } else {
        console.log('No existing session found');
        setUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
      setUserRole(null);
    }
  }, [setUser, setUserRole, navigate]);

  useEffect(() => {
    initializeAuth();

    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change event:', event);
      
      if (event === 'SIGNED_IN') {
        console.log('User signed in, setting up account');
        setUser(session?.user || null);
        await setupUserAccount(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
      } else if (event === 'USER_UPDATED') {
        console.log('User updated');
        setUser(session?.user || null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, setUser, setUserRole, setupUserAccount]);

  return { user, userRole };
}
