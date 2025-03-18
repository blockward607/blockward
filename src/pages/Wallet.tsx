
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Wallet as WalletIcon, 
  Trophy, 
  Send, 
  Plus, 
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Tag 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Json } from "@/integrations/supabase/types";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { TransferForm } from "@/components/wallet/TransferForm";
import { NFTGrid } from "@/components/wallet/NFTGrid";
import { NFTDisclaimer } from "@/components/wallet/NFTDisclaimer";
import { BlockwardTemplateCreator } from "@/components/wallet/BlockwardTemplateCreator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

const WalletPage = () => {
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
      
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
        
      if (roleData) {
        setUserRole(roleData.role as 'teacher' | 'student');
      }
      
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
        
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('points')
          .eq('user_id', session.user.id)
          .single();
          
        if (studentData) {
          setBalance(studentData.points || 0);
        }
        
        if (walletData) {
          const { data: nftData, error: nftError } = await supabase
            .from('nfts')
            .select('*')
            .eq('owner_wallet_id', walletData.id);
            
          if (nftError) {
            console.error('Error fetching BlockWards:', nftError);
            throw nftError;
          }
          
          const transformedNfts: NFT[] = (nftData || []).map((nft: SupabaseNFT) => {
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
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="p-8 text-center animate-pulse">
          <WalletIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/50 to-indigo-900/50 p-8 shadow-lg">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rotate-12 bg-purple-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 -rotate-12 bg-indigo-500/10 blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-purple-600/30 shadow-[0_0_15px_rgba(147,51,234,0.5)] animate-pulse">
              <WalletIcon className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold shimmer-text">
                BlockWard Wallet
              </h1>
              <p className="text-gray-400">
                {userRole === 'teacher' ? 'Teacher Admin Wallet' : 'Student Rewards Wallet'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Card className="bg-purple-900/20 border-purple-500/20">
              <CardContent className="p-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-400" />
                <span className="text-sm">
                  {wallet?.address?.substring(0, 6)}...{wallet?.address?.substring(wallet.address.length - 4)}
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="md:col-span-3 space-y-6">
          <BalanceCard 
            balance={balance} 
            walletAddress={wallet?.address} 
            isLoading={isLoading} 
          />
          
          {userRole === 'teacher' && (
            <Card className="overflow-hidden border-purple-500/20 transition-all hover:shadow-md hover:shadow-purple-500/10">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Send className="h-5 w-5 text-purple-400" />
                  Teacher Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <TransferForm disabled={isLoading} />
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Main Content Area */}
        <div className="md:col-span-9 space-y-6">
          {userRole === 'teacher' ? (
            <Card className="border-purple-500/20 transition-all hover:shadow-md hover:shadow-purple-500/10">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5 text-purple-400" />
                  Create BlockWard Templates
                </CardTitle>
                <CardDescription>
                  Design custom BlockWards to award to your students
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <BlockwardTemplateCreator />
              </CardContent>
            </Card>
          ) : (
            <Card className="border-purple-500/20 transition-all hover:shadow-md hover:shadow-purple-500/10">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-purple-400" />
                  Your BlockWards
                </CardTitle>
                <CardDescription>
                  Collect these digital achievements to showcase your educational progress
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <NFTGrid nfts={nfts} isLoading={isLoading} />
                <div className="mt-4">
                  <NFTDisclaimer />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
