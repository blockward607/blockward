
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { WalletPanel } from "@/components/wallet/WalletPanel";
import { Json } from "@/integrations/supabase/types";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { TransferForm } from "@/components/wallet/TransferForm";
import { NFTGrid } from "@/components/wallet/NFTGrid";
import { NFTDisclaimer } from "@/components/wallet/NFTDisclaimer";

interface NFTMetadata {
  name: string;
  description: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFT {
  id: string;
  metadata: NFTMetadata;
  image_url: string | null;
  created_at: string;
}

interface SupabaseNFT {
  id: string;
  metadata: Json;
  image_url: string | null;
  created_at: string;
  creator_wallet_id: string;
  owner_wallet_id: string;
  token_id: string;
  contract_address: string;
  network: string;
  updated_at: string;
}

interface Wallet {
  id: string;
  address: string;
  type: 'user' | 'admin';
}

const Wallet = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "Please log in to access your wallet"
        });
        navigate('/auth');
        return;
      }
      
      setIsAuthenticated(true);
      
      // Check user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
        
      if (roleData) {
        setUserRole(roleData.role as 'teacher' | 'student');
      }
      
      // Load user wallet
      try {
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (walletError) {
          console.error('Error fetching wallet:', walletError);
          throw walletError;
        }
        
        setWallet(walletData);
        
        // Load student points as balance
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('points')
          .eq('user_id', session.user.id)
          .single();
          
        if (studentData) {
          setBalance(studentData.points || 0);
        }
        
        // Load BlockWards
        if (walletData) {
          const { data: nftData, error: nftError } = await supabase
            .from('nfts')
            .select('*')
            .eq('owner_wallet_id', walletData.id);
            
          if (nftError) {
            console.error('Error fetching BlockWards:', nftError);
            throw nftError;
          }
          
          // Transform the Supabase NFT data to match our NFT interface
          const transformedNfts: NFT[] = (nftData || []).map((nft: SupabaseNFT) => {
            // Parse the metadata JSON if it's a string
            const parsedMetadata: NFTMetadata = typeof nft.metadata === 'string' 
              ? JSON.parse(nft.metadata) 
              : (nft.metadata as unknown as NFTMetadata);
              
            return {
              id: nft.id,
              metadata: {
                name: parsedMetadata.name || `BlockWard #${nft.id.substring(0, 4)}`,
                description: parsedMetadata.description || "Educational achievement award",
                image: parsedMetadata.image,
                attributes: parsedMetadata.attributes || []
              },
              image_url: nft.image_url,
              created_at: nft.created_at
            };
          });
          
          setNfts(transformedNfts);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing wallet:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load wallet data"
        });
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">BlockWard Wallet</h1>
      
      <WalletPanel expanded={false} />
      
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <BalanceCard 
            balance={balance} 
            walletAddress={wallet?.address} 
            isLoading={isLoading} 
          />
          
          {userRole === 'teacher' && (
            <TransferForm disabled={isLoading} />
          )}
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your BlockWards</h2>
            {userRole === 'teacher' && (
              <Button size="sm" variant="outline" onClick={() => navigate('/rewards')}>
                <Plus className="w-4 h-4 mr-2" />
                Create BlockWard
              </Button>
            )}
          </div>
          
          <NFTGrid nfts={nfts} isLoading={isLoading} />
          
          <NFTDisclaimer />
        </div>
      </div>
    </div>
  );
};

export default Wallet;
