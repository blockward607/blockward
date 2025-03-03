
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, AlertTriangle, Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Plus, Medal, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { WalletPanel } from "@/components/wallet/WalletPanel";

interface NFT {
  id: string;
  metadata: {
    name: string;
    description: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  image_url: string | null;
  created_at: string;
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
  const [isTransferring, setIsTransferring] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");

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
        
        // Load NFTs
        if (walletData) {
          const { data: nftData, error: nftError } = await supabase
            .from('nfts')
            .select('*')
            .eq('owner_wallet_id', walletData.id);
            
          if (nftError) {
            console.error('Error fetching NFTs:', nftError);
            throw nftError;
          }
          
          setNfts(nftData || []);
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

  const handleSendPoints = () => {
    setIsTransferring(true);
    // In a real app, this would send points to another wallet
    toast({
      title: "Send Points",
      description: "This feature is coming soon!"
    });
    setIsTransferring(false);
  };

  const handleReceivePoints = () => {
    // In a real app, this would show a QR code or address to receive points
    toast({
      title: "Receive Points",
      description: `Your wallet address: ${wallet?.address?.substring(0, 10)}...`
    });
  };

  if (!isAuthenticated) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">NFT Wallet</h1>
      
      <WalletPanel expanded={false} />
      
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-purple-600/20">
              <WalletIcon className="w-8 h-8 text-purple-400 mb-2" />
              <h3 className="font-semibold">Balance</h3>
              <p className="text-2xl font-bold text-purple-400">{balance} Points</p>
              <p className="text-sm text-purple-300/70 mt-1">Wallet: {wallet?.address?.substring(0, 10)}...</p>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full"
                onClick={handleSendPoints}
                disabled={isTransferring}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Send Points
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleReceivePoints}
              >
                <ArrowDownRight className="w-4 h-4 mr-2" />
                Receive Points
              </Button>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-gray-700">
              <h3 className="font-semibold text-sm">Quick Transfer</h3>
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input 
                  id="recipient"
                  placeholder="Enter wallet address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="flex-1"
                    disabled={!recipientAddress}
                    onClick={() => {
                      toast({
                        title: "Transfer Initiated",
                        description: "Demo: This would transfer 10 points"
                      });
                      setRecipientAddress("");
                    }}
                  >
                    Send 10
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="flex-1"
                    disabled={!recipientAddress} 
                    onClick={() => {
                      toast({
                        title: "Transfer Initiated",
                        description: "Demo: This would transfer 50 points"
                      });
                      setRecipientAddress("");
                    }}
                  >
                    Send 50
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your NFTs</h2>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading your NFTs...</p>
            </div>
          ) : nfts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {nfts.map((nft) => (
                <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-purple-900/20 relative">
                    {nft.image_url ? (
                      <img 
                        src={nft.image_url} 
                        alt={nft.metadata.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Medal className="w-16 h-16 text-purple-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-purple-800 text-white text-xs px-2 py-1 rounded-full">
                      NFT
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{nft.metadata.name || `NFT #${nft.id.substring(0, 4)}`}</h3>
                      <Tag className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{nft.metadata.description || "Educational achievement NFT"}</p>
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {nft.metadata.attributes?.slice(0, 2).map((attr, index) => (
                        <span key={index} className="text-xs bg-purple-900/30 px-2 py-1 rounded">
                          {attr.trait_type}: {attr.value}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No NFTs Found</h3>
              <p className="text-gray-400 mb-4">You haven't received any NFT rewards yet.</p>
              <p className="text-sm text-gray-500">Complete achievements and assignments to earn NFT rewards!</p>
            </Card>
          )}
          
          <Card className="p-4 border border-yellow-600/30 bg-yellow-950/20">
            <div className="flex gap-4">
              <AlertTriangle className="w-10 h-10 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-300">NFT Ownership</h3>
                <p className="text-sm text-gray-300">NFTs in this wallet represent academic achievements and rewards. These digital certificates are stored on a private blockchain for educational purposes.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
