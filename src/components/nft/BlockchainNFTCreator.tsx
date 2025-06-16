
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
import { StudentSelect } from "./StudentSelect";
import { NFTImageUpload } from "./NFTImageUpload";

export const BlockchainNFTCreator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
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
    
    if (!imageUrl || !selectedStudent) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a student and upload an image"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Get student's wallet address
      const { data: studentWallet, error: walletError } = await supabase
        .from('encrypted_wallets')
        .select('wallet_address')
        .eq('user_id', selectedStudent)
        .single();

      if (walletError || !studentWallet) {
        throw new Error("Student wallet not found");
      }

      // Prepare NFT metadata
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

      let mintResult;
      
      if (useBlockchain) {
        // Real blockchain minting
        mintResult = await BlockchainNFTService.mintNFT(
          studentWallet.wallet_address,
          metadata,
          session.user.id
        );
      } else {
        // Simulated minting
        mintResult = await BlockchainNFTService.simulateMint(
          studentWallet.wallet_address,
          metadata
        );
      }

      if (!mintResult.success) {
        throw new Error(mintResult.error || "Failed to mint NFT");
      }

      // Save NFT to database
      const { data: teacherWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      const { data: studentWalletRecord } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', selectedStudent)
        .single();

      const { error: nftError } = await supabase.from('nfts').insert({
        token_id: mintResult.tokenId,
        contract_address: '0x4f05A50AF9aCd968A31605c59C376B35EF352aC1',
        metadata,
        creator_wallet_id: teacherWallet?.id,
        owner_wallet_id: studentWalletRecord?.id,
        image_url: imageUrl,
        network: "polygon-mumbai",
        blockchain_token_id: parseInt(mintResult.tokenId.replace('sim-', '') || '0'),
        transaction_hash: mintResult.transactionHash,
        blockchain_status: useBlockchain ? 'minted' : 'pending',
        minted_at: new Date().toISOString()
      });

      if (nftError) throw nftError;

      // Award points to student
      const { error: pointsError } = await supabase
        .rpc('increment_student_points', {
          student_id: selectedStudent,
          points_to_add: formData.points
        });

      if (pointsError) throw pointsError;

      toast({
        title: "NFT Created Successfully!",
        description: useBlockchain 
          ? "BlockWard minted on Polygon Mumbai blockchain"
          : "BlockWard created and will be minted on blockchain",
      });

      // Reset form
      setFormData({ title: "", description: "", points: 100, nftType: "academic" });
      setImageUrl(null);
      setSelectedStudent("");
      
    } catch (error: any) {
      console.error('Error creating blockchain NFT:', error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Failed to create blockchain NFT",
      });
    } finally {
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

          <StudentSelect
            selectedStudentId={selectedStudent}
            onStudentSelect={setSelectedStudent}
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
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !formData.title || !imageUrl || !selectedStudent}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {useBlockchain ? "Minting on Blockchain..." : "Creating NFT..."}
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
