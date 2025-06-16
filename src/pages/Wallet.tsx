
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
  Tag,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Json } from "@/integrations/supabase/types";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { TransferForm } from "@/components/wallet/TransferForm";
import { NFTDisclaimer } from "@/components/wallet/NFTDisclaimer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlockchainWallet } from "@/hooks/useBlockchainWallet";
import { BlockchainWalletInfo } from "@/components/wallet/BlockchainWalletInfo";
import { BlockchainNFTCreator } from "@/components/nft/BlockchainNFTCreator";
import { BlockchainNFTGrid } from "@/components/wallet/BlockchainNFTGrid";

interface NFTMetadata {
  name: string;
  description: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface BlockchainNFT {
  id: string;
  metadata: NFTMetadata;
  image_url: string | null;
  blockchain_token_id: number | null;
  transaction_hash: string | null;
  blockchain_status: string;
  minted_at: string | null;
  created_at: string;
}

const WalletPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [blockchainNfts, setBlockchainNfts] = useState<BlockchainNFT[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const { 
    walletAddress, 
    isLoading: walletLoading, 
    userRole, 
    canMintNFTs, 
    canTransferNFTs 
  } = useBlockchainWallet();

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
      await loadWalletData(session.user.id);
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate, toast]);

  const loadWalletData = async (userId: string) => {
    try {
      // Load student points
      const { data: studentData } = await supabase
        .from('students')
        .select('points')
        .eq('user_id', userId)
        .single();
        
      if (studentData) {
        setBalance(studentData.points || 0);
      }

      // Load blockchain NFTs
      const { data: walletData } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (walletData) {
        const { data: nftData, error: nftError } = await supabase
          .from('nfts')
          .select(`
            id,
            metadata,
            image_url,
            blockchain_token_id,
            transaction_hash,
            blockchain_status,
            minted_at,
            created_at
          `)
          .eq('owner_wallet_id', walletData.id)
          .order('created_at', { ascending: false });
          
        if (nftError) {
          console.error('Error fetching blockchain NFTs:', nftError);
        } else {
          const transformedNfts: BlockchainNFT[] = (nftData || []).map((nft: any) => {
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
              blockchain_token_id: nft.blockchain_token_id,
              transaction_hash: nft.transaction_hash,
              blockchain_status: nft.blockchain_status || 'pending',
              minted_at: nft.minted_at,
              created_at: nft.created_at
            };
          });
          
          setBlockchainNfts(transformedNfts);
        }
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

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
              <Zap className="w-8 h-8 text-purple-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold shimmer-text">
                Blockchain Wallet
              </h1>
              <p className="text-gray-400">
                Virtual wallet with real blockchain integration
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Card className="bg-purple-900/20 border-purple-500/20">
              <CardContent className="p-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-400" />
                <span className="text-sm">
                  Polygon Mumbai
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <BalanceCard 
            balance={balance} 
            walletAddress={walletAddress} 
            isLoading={isLoading || walletLoading} 
          />
          
          <BlockchainWalletInfo
            walletAddress={walletAddress}
            userRole={userRole}
            isLoading={walletLoading}
          />
          
          {canTransferNFTs && (
            <Card className="overflow-hidden border-purple-500/20 transition-all hover:shadow-md hover:shadow-purple-500/10">
              <CardHeader className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Send className="h-5 w-5 text-purple-400" />
                  Teacher Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <TransferForm disabled={isLoading || walletLoading} />
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue={canMintNFTs ? "create" : "collection"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {canMintNFTs && (
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create NFTs
                </TabsTrigger>
              )}
              <TabsTrigger value="collection" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                My Collection
              </TabsTrigger>
            </TabsList>
            
            {canMintNFTs && (
              <TabsContent value="create" className="space-y-6">
                <BlockchainNFTCreator />
              </TabsContent>
            )}
            
            <TabsContent value="collection" className="space-y-6">
              <Card className="border-purple-500/20 transition-all hover:shadow-md hover:shadow-purple-500/10">
                <CardHeader className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-purple-400" />
                    Blockchain NFT Collection
                  </CardTitle>
                  <CardDescription>
                    Your blockchain-verified digital achievements
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <BlockchainNFTGrid 
                    nfts={blockchainNfts} 
                    isLoading={isLoading} 
                    userRole={userRole}
                  />
                  <div className="mt-6">
                    <NFTDisclaimer />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
