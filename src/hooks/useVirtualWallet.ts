
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VirtualWalletService } from '@/services/VirtualWalletService';
import { useToast } from '@/hooks/use-toast';

export const useVirtualWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        // Get user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (roleData) {
          setUserRole(roleData.role as 'teacher' | 'student');
        }

        // Check if user has a virtual wallet
        const { data: encryptedWallet } = await supabase
          .from('encrypted_wallets')
          .select('wallet_address')
          .eq('user_id', session.user.id)
          .single();

        if (encryptedWallet) {
          setWalletAddress(encryptedWallet.wallet_address);
        } else {
          // Generate wallet for new user
          console.log('Generating new virtual wallet for user...');
          const result = await VirtualWalletService.generateWalletForUser(session.user.id);
          
          if (result.success) {
            setWalletAddress(result.address);
            toast({
              title: "Virtual Wallet Created",
              description: "Your secure virtual wallet has been generated!",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Wallet Generation Failed",
              description: result.error || "Failed to create virtual wallet",
            });
          }
        }
      } catch (error) {
        console.error('Error initializing virtual wallet:', error);
        toast({
          variant: "destructive",
          title: "Wallet Error",
          description: "Failed to initialize virtual wallet",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeWallet();
  }, [toast]);

  return {
    walletAddress,
    isLoading,
    userRole,
    canMintNFTs: userRole === 'teacher',
    canTransferNFTs: userRole === 'teacher',
    canExportWallet: false // Never allow private key export
  };
};
