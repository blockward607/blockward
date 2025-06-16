
import { VirtualWalletPanel } from "@/components/wallet/VirtualWalletPanel";
import { CreateNFTAward } from "@/components/nft/CreateNFTAward";
import { TeacherNFTLibrary } from "@/components/nft/TeacherNFTLibrary";
import { NFTGrid } from "@/components/wallet/NFTGrid";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Trophy, Plus, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const WalletPage = () => {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);
  const [studentNFTs, setStudentNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
    loadStudentNFTs();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      setUserRole(roleData?.role as 'teacher' | 'student');
    } catch (error) {
      console.error('Error checking user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentNFTs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get user's wallet
      const { data: walletData } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (walletData) {
        // Load NFTs owned by this wallet
        const { data: nftData, error } = await supabase
          .from('nfts')
          .select('*')
          .eq('owner_wallet_id', walletData.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedNfts: NFT[] = (nftData || []).map((nft: any) => {
          const parsedMetadata = typeof nft.metadata === 'string' 
            ? JSON.parse(nft.metadata) 
            : nft.metadata;
            
          return {
            id: nft.id,
            metadata: {
              name: parsedMetadata.name || `BlockWard #${nft.id.substring(0, 4)}`,
              description: parsedMetadata.description || "Educational achievement award",
              attributes: parsedMetadata.attributes || []
            },
            image_url: nft.image_url,
            created_at: nft.created_at
          };
        });

        setStudentNFTs(transformedNfts);
      }
    } catch (error) {
      console.error('Error loading student NFTs:', error);
    }
  };

  const refreshNFTs = () => {
    loadStudentNFTs();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <motion.div 
        className="flex items-center gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="p-4 rounded-full bg-purple-600/30 shadow-[0_0_15px_rgba(147,51,234,0.5)] animate-pulse">
          <Wallet className="w-8 h-8 text-purple-300" />
        </div>
        <h1 className="text-4xl font-bold shimmer-text">
          Virtual Wallet
        </h1>
      </motion.div>

      {userRole === 'teacher' ? (
        <Tabs defaultValue="library" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <TabsList className="p-1 bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl">
              <TabsTrigger value="library" className="flex items-center gap-2 data-[state=active]:bg-purple-600/30 data-[state=active]:text-white">
                <Trophy className="w-4 h-4" />
                My Library
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2 data-[state=active]:bg-purple-600/30 data-[state=active]:text-white">
                <Plus className="w-4 h-4" />
                Create NFT Award
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex items-center gap-2 data-[state=active]:bg-purple-600/30 data-[state=active]:text-white">
                <Shield className="w-4 h-4" />
                Wallet Details
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="library">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="p-6 glass-card border border-purple-500/30 shadow-[0_5px_25px_rgba(147,51,234,0.3)]">
                <TeacherNFTLibrary />
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="create">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <CreateNFTAward />
            </motion.div>
          </TabsContent>

          <TabsContent value="wallet">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <VirtualWalletPanel />
            </motion.div>
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue="nfts" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <TabsList className="p-1 bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl">
              <TabsTrigger value="nfts" className="flex items-center gap-2 data-[state=active]:bg-purple-600/30 data-[state=active]:text-white">
                <Trophy className="w-4 h-4" />
                My BlockWards
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex items-center gap-2 data-[state=active]:bg-purple-600/30 data-[state=active]:text-white">
                <Shield className="w-4 h-4" />
                Wallet Details
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="nfts">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="p-6 glass-card border border-purple-500/30 shadow-[0_5px_25px_rgba(147,51,234,0.3)]">
                <NFTGrid nfts={studentNFTs} isLoading={loading} />
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="wallet">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <VirtualWalletPanel />
            </motion.div>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Decorative elements */}
      <div className="hidden md:block">
        <div className="hexagon absolute top-20 right-20 w-28 h-28 bg-gradient-to-r from-purple-500/10 to-pink-500/10 -z-10"></div>
        <div className="hexagon absolute bottom-20 left-40 w-36 h-36 bg-gradient-to-r from-blue-500/10 to-purple-500/10 -z-10"></div>
      </div>
    </motion.div>
  );
};

export default WalletPage;
