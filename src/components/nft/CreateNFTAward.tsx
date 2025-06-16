
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, TestTube } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { VirtualNFTCreator } from "./VirtualNFTCreator";

export const CreateNFTAward = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-full bg-purple-600/20">
          <Trophy className="w-6 h-6 text-purple-400" />
        </div>
        <h2 className="text-2xl font-semibold gradient-text">Create BlockWard Award</h2>
      </div>

      <Tabs defaultValue="virtual" className="space-y-6">
        <TabsList className="p-1 bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl">
          <TabsTrigger value="virtual" className="flex items-center gap-2 data-[state=active]:bg-green-600/30 data-[state=active]:text-white">
            <TestTube className="w-4 h-4" />
            Create Virtual NFT
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center gap-2 data-[state=active]:bg-purple-600/30 data-[state=active]:text-white">
            <Zap className="w-4 h-4" />
            Mint Real NFT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="virtual">
          <VirtualNFTCreator />
        </TabsContent>

        <TabsContent value="blockchain">
          <Card className="p-6 glass-card">
            <div className="text-center py-8 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-300 mb-2">
                Blockchain NFT Creation
              </h3>
              <p className="text-gray-400 mb-4">
                Create real blockchain NFTs that are permanently stored on the blockchain
              </p>
              <div className="bg-amber-900/20 p-3 rounded-lg border border-amber-500/30 mb-4">
                <p className="text-sm text-amber-300">
                  ⚠️ This feature requires MetaMask wallet connection and MATIC tokens for gas fees
                </p>
              </div>
              <Button 
                disabled
                className="bg-purple-600 hover:bg-purple-700 opacity-50"
              >
                Coming Soon - Blockchain Integration
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
