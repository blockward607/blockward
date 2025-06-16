
import { WalletPanel } from "@/components/wallet/WalletPanel";
import { BlockchainWalletPanel } from "@/components/wallet/BlockchainWalletPanel";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Coins } from "lucide-react";
import { motion } from "framer-motion";

const WalletPage = () => {
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
          NFT Wallet
        </h1>
      </motion.div>

      <Tabs defaultValue="nfts" className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <TabsList className="p-1 bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl">
            <TabsTrigger value="nfts" className="flex items-center gap-2 data-[state=active]:bg-purple-600/30 data-[state=active]:text-white">
              <Wallet className="w-4 h-4" />
              BlockWard NFTs
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="flex items-center gap-2 data-[state=active]:bg-purple-600/30 data-[state=active]:text-white">
              <Coins className="w-4 h-4" />
              Blockchain Wallet
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
              <WalletPanel />
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="blockchain">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="p-6 glass-card border border-purple-500/30 shadow-[0_5px_25px_rgba(147,51,234,0.3)]">
              <BlockchainWalletPanel />
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
      
      {/* Decorative elements */}
      <div className="hidden md:block">
        <div className="hexagon absolute top-20 right-20 w-28 h-28 bg-gradient-to-r from-purple-500/10 to-pink-500/10 -z-10"></div>
        <div className="hexagon absolute bottom-20 left-40 w-36 h-36 bg-gradient-to-r from-blue-500/10 to-purple-500/10 -z-10"></div>
      </div>
    </motion.div>
  );
};

export default WalletPage;
