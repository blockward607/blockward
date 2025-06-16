import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Loader2, Zap, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BlockchainNFTService } from "@/services/BlockchainNFTService";
import { NFTImageUpload } from "./NFTImageUpload";

export const BlockchainNFTCreator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [useBlockchain, setUseBlockchain] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 100,
    nftType: "academic"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 NFT Creation Started");
    console.log("Form Data:", formData);
    console.log("Image URL:", imageUrl);
    console.log("Use Blockchain:", useBlockchain);
    
    // Enhanced validation with detailed logging
    if (!imageUrl) {
      console.error("❌ Validation failed: Missing image");
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please upload an image"
      });
      return;
    }

    if (!formData.title.trim()) {
      console.error("❌ Validation failed: Missing title");
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter a title"
      });
      return;
    }

    if (!formData.description.trim()) {
      console.error("❌ Validation failed: Missing description");
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter a description"
      });
      return;
    }

    console.log("✅ Validation passed, starting NFT creation...");
    setLoading(true);

    try {
      // Get session with detailed logging
      console.log("🔐 Getting user session...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("❌ Session error:", sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session) {
        console.error("❌ No active session found");
        throw new Error("Not authenticated");
      }
      
      console.log("✅ Session found for user:", session.user.id);

      // Get teacher's wallet with detailed logging
      console.log("👛 Looking up teacher wallet...");
      const { data: teacherWallet, error: walletError } = await supabase
        .from('wallets')
        .select('id, address')
        .eq('user_id', session.user.id)
        .single();

      if (walletError) {
        console.error("❌ Wallet lookup error:", walletError);
        throw new Error(`Wallet lookup failed: ${walletError.message}`);
      }

      if (!teacherWallet) {
        console.error("❌ No wallet found for user:", session.user.id);
        throw new Error("Teacher wallet not found");
      }

      console.log("✅ Teacher wallet found:", teacherWallet);

      // Prepare NFT metadata with logging
      console.log("📝 Preparing NFT metadata...");
      const metadata = {
        name: formData.title,
        description: formData.description,
        image: imageUrl,
        attributes: [
          { trait_type: "Type", value: formData.nftType },
          { trait_type: "Points", value: formData.points.toString() },
          { trait_type: "Created By", value: "BlockWard Teacher" }
        ]
      };
      console.log("📦 Metadata prepared:", metadata);

      let mintResult;
      
      if (useBlockchain) {
        console.log("⛓️ Starting real blockchain minting...");
        mintResult = await BlockchainNFTService.mintNFT(
          teacherWallet.address,
          metadata,
          session.user.id
        );
      } else {
        console.log("🎭 Starting simulated minting...");
        mintResult = await BlockchainNFTService.simulateMint(
          teacherWallet.address,
          metadata
        );
      }

      console.log("🎯 Mint result:", mintResult);

      if (!mintResult.success) {
        console.error("❌ Minting failed:", mintResult.error);
        throw new Error(mintResult.error || "Failed to mint NFT");
      }

      console.log("✅ NFT minted successfully, saving to database...");

      // Prepare database record with detailed logging - FIXED NETWORK VALUE
      const nftRecord = {
        token_id: mintResult.tokenId,
        contract_address: '0x4f05A50AF9aCd968A31605c59C376B35EF352aC1',
        metadata,
        creator_wallet_id: teacherWallet.id,
        owner_wallet_id: teacherWallet.id,
        image_url: imageUrl,
        network: useBlockchain ? "mainnet" : "testnet", // Fixed: Use allowed network values
        blockchain_token_id: parseInt(mintResult.tokenId.replace('sim-', '') || '0'),
        transaction_hash: mintResult.transactionHash,
        blockchain_status: useBlockchain ? 'minted' : 'pending',
        minted_at: new Date().toISOString()
      };

      console.log("💾 Saving NFT record to database:", nftRecord);

      const { data: insertedNft, error: nftError } = await supabase
        .from('nfts')
        .insert(nftRecord)
        .select()
        .single();

      if (nftError) {
        console.error("❌ Database insertion error:", nftError);
        console.error("❌ Failed record:", nftRecord);
        throw new Error(`Database error: ${nftError.message}`);
      }

      console.log("✅ NFT saved successfully to database:", insertedNft);

      toast({
        title: "NFT Created Successfully!",
        description: `${useBlockchain ? 'Blockchain' : 'Virtual'} NFT added to your library`,
      });

      // Reset form
      console.log("🔄 Resetting form...");
      setFormData({ title: "", description: "", points: 100, nftType: "academic" });
      setImageUrl(null);

      // Trigger library refresh
      console.log("🔄 Triggering library refresh...");
      window.dispatchEvent(new CustomEvent('nftCreated'));
      
      console.log("🎉 NFT creation process completed successfully!");
      
    } catch (error: any) {
      console.error("💥 Error creating NFT:", error);
      console.error("💥 Error stack:", error.stack);
      
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Failed to create NFT. Check console for details.",
      });
    } finally {
      console.log("🏁 Setting loading to false");
      setLoading(false);
    }
  };

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-400" />
          Create Blockchain NFT Award
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Award Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            
            <Select 
              value={formData.nftType} 
              onValueChange={(value) => setFormData({ ...formData, nftType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Award Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academic">Academic Excellence</SelectItem>
                <SelectItem value="behavior">Behavior Recognition</SelectItem>
                <SelectItem value="attendance">Perfect Attendance</SelectItem>
                <SelectItem value="special">Special Achievement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Award Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-[100px]"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Points Value"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
              required
            />
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={useBlockchain ? "default" : "outline"}
                onClick={() => setUseBlockchain(!useBlockchain)}
                className="flex-1"
              >
                {useBlockchain ? (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Real Blockchain
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Simulated
                  </>
                )}
              </Button>
            </div>
          </div>

          <NFTImageUpload
            imageUrl={imageUrl}
            onImageSelect={setImageUrl}
          />

          <div className="bg-indigo-900/20 p-4 rounded border border-indigo-500/30">
            <div className="text-sm text-indigo-300 space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Secure virtual wallet system</span>
              </div>
              <div>✓ No MetaMask required</div>
              <div>✓ Gas fees handled automatically</div>
              <div>✓ Private keys encrypted and secured</div>
              <div>✓ {useBlockchain ? 'Real blockchain transaction' : 'Simulated for demo'}</div>
              <div>✓ Created NFTs go to your library for distribution</div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !formData.title.trim() || !formData.description.trim() || !imageUrl}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {useBlockchain ? "Minting on Blockchain..." : "Creating Virtual NFT..."}
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                {useBlockchain ? "Mint Blockchain NFT" : "Create Virtual NFT"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
