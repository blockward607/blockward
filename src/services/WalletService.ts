
import { supabase } from '@/integrations/supabase/client';

export const WalletService = {
  // Check if a wallet exists
  checkUserWallet: async (userId: string) => {
    console.log('Checking wallet for user:', userId);
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error && !error.message.includes('No rows found')) {
      console.error('Error checking user wallet:', error);
      throw error;
    }
    
    return { data, error };
  },
  
  // Create a user wallet
  createUserWallet: async (userId: string, type: 'user' | 'admin', address: string) => {
    console.log('Creating wallet:', { userId, type, address });
    const { data, error } = await supabase
      .from('wallets')
      .insert({ 
        user_id: userId, 
        type,
        address
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user wallet:', error);
      throw error;
    }
    
    console.log('Wallet created successfully:', data);
    return { data, error };
  }
};
