import { NFTShowcase } from "@/components/NFTShowcase";
import { CreateNFTAward } from "@/components/nft/CreateNFTAward";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, ImagePlus } from "lucide-react";

const Rewards = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-full bg-purple-600/20">
          <Trophy className="w-6 h-6 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold gradient-text">Rewards & NFTs</h1>
      </div>

      <Tabs defaultValue="showcase" className="space-y-4">
        <TabsList>
          <TabsTrigger value="showcase" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            NFT Showcase
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <ImagePlus className="w-4 h-4" />
            Create Award
          </TabsTrigger>
        </TabsList>

        <TabsContent value="showcase">
          <Card className="p-6 glass-card">
            <NFTShowcase />
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <CreateNFTAward />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rewards;