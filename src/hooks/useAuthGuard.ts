
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VirtualWalletService } from '@/services/VirtualWalletService';

export const useAuthGuard = () => {
  useEffect(() => {
    const initializeUserWallet = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Initialize virtual wallet for user
        await VirtualWalletService.initializeUserWallet(session.user.id);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Initialize wallet when user signs in for the first time
          await VirtualWalletService.initializeUserWallet(session.user.id);
        }
      }
    );

    // Initialize on mount if already logged in
    initializeUserWallet();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};
