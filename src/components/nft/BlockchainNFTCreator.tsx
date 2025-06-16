
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Loader2, Zap, Shield, HelpCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BlockchainNFTService } from "@/services/BlockchainNFTService";
import { StudentSelect } from "./StudentSelect";
import { NFTImageUpload } from "./NFTImageUpload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

export const BlockchainNFTCreator = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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

      // Save NFT to database - initially owned by teacher
      const { data: teacherWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      const { error: nftError } = await supabase.from('nfts').insert({
        token_id: mintResult.tokenId,
        contract_address: '0x4f05A50AF9aCd968A31605c59C376B35EF352aC1',
        metadata,
        creator_wallet_id: teacherWallet?.id,
        owner_wallet_id: teacherWallet?.id, // Initially owned by teacher
        image_url: imageUrl,
        network: "polygon-mumbai",
        blockchain_token_id: parseInt(mintResult.tokenId.replace('sim-', '') || '0'),
        transaction_hash: mintResult.transactionHash,
        blockchain_status: useBlockchain ? 'minted' : 'pending',
        minted_at: new Date().toISOString()
      });

      if (nftError) throw nftError;

      toast({
        title: "🎉 Award Created Successfully!",
        description: useBlockchain 
          ? "Your NFT award has been added to your library and is ready to send"
          : "Your NFT award has been created in your library",
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
        description: error.message || "Failed to create NFT award",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-600/30">
              <Trophy className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <div className="text-xl">🏅 Create NFT Award</div>
              <div className="text-sm text-gray-400 font-normal">
                Design and mint digital achievement awards for your students
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Award Details Section */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-purple-300 mb-2 block">
                  🏆 Award Type
                </label>
                <Select 
                  value={formData.nftType} 
                  onValueChange={(value) => setFormData({ ...formData, nftType: value })}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Choose what this award recognizes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">🎓 Academic Excellence</SelectItem>
                    <SelectItem value="behavior">⭐ Behavior Recognition</SelectItem>
                    <SelectItem value="attendance">📅 Perfect Attendance</SelectItem>
                    <SelectItem value="special">🌟 Special Achievement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-purple-300 mb-2 block">
                  📝 Award Title
                </label>
                <Input
                  placeholder="e.g., Mathematics Excellence Award"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="glass-input"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-purple-300 mb-2 block">
                  💭 Tell us what this award is for...
                </label>
                <Textarea
                  placeholder="Describe the achievement this award recognizes. What did the student do to earn this?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-purple-300 mb-2 block">
                  💎 Learning Credits Value
                </label>
                <Input
                  type="number"
                  placeholder="100"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  className="glass-input"
                  min="1"
                  max="1000"
                  required
                />
                <div className="text-xs text-gray-400 mt-1">
                  Higher values for more significant achievements (1-1000 credits)
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <NFTImageUpload
              imageUrl={imageUrl}
              onImageSelect={setImageUrl}
            />

            {/* Student Selection */}
            <div>
              <label className="text-sm font-medium text-purple-300 mb-2 block">
                👨‍🎓 Award Recipient
              </label>
              <StudentSelect
                selectedStudentId={selectedStudent}
                onStudentSelect={setSelectedStudent}
                placeholder="Choose which student will receive this award"
              />
            </div>

            {/* Blockchain Settings */}
            <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-indigo-300">Blockchain Processing</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-indigo-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Choose between real blockchain transactions (permanent and verifiable) or demo mode (for testing without blockchain costs)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button
                  type="button"
                  variant={useBlockchain ? "default" : "outline"}
                  onClick={() => setUseBlockchain(!useBlockchain)}
                  size="sm"
                >
                  {useBlockchain ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Real Blockchain
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Demo Mode
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-sm text-indigo-300 space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure virtual wallet system</span>
                </div>
                <div>✓ No MetaMask required from students</div>
                <div>✓ Gas fees handled automatically</div>
                <div>✓ Private keys encrypted and secured</div>
                <div>✓ {useBlockchain ? 'Permanent blockchain record' : 'Testing mode - no blockchain transaction'}</div>
              </div>
            </div>

            {/* Award Preview Card */}
            {formData.title && imageUrl && (
              <div className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 p-4 rounded-lg border border-amber-500/30">
                <div className="text-sm font-medium text-amber-300 mb-3">🔮 Award Preview</div>
                <div className="bg-black/30 rounded-lg p-4 flex items-center gap-4">
                  <img 
                    src={imageUrl} 
                    alt="Award preview" 
                    className="w-16 h-16 object-cover rounded-lg border border-purple-500/30"
                  />
                  <div>
                    <div className="font-medium text-purple-200">{formData.title}</div>
                    <div className="text-sm text-gray-400 line-clamp-2">{formData.description}</div>
                    <div className="text-xs text-green-400 mt-1">+{formData.points} Learning Credits</div>
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading || !formData.title || !imageUrl || !selectedStudent}
              className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {useBlockchain ? "Minting on Blockchain..." : "Creating Award..."}
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  {useBlockchain ? "🚀 Mint Blockchain NFT" : "✨ Create Award (Demo)"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
