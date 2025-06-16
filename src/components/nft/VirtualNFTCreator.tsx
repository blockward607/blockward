
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, ImagePlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NFTImageUpload } from "./NFTImageUpload";

export const VirtualNFTCreator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 100,
    reason: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to create NFTs");
      }
      
      // Get teacher wallet
      const { data: teacherWallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (walletError) {
        throw walletError;
      }
      
      // Create NFT metadata
      const metadata = {
        name: formData.title,
        description: formData.description,
        points: formData.points,
        reason: formData.reason,
        type: "virtual",
        image: imageUrl,
        created_at: new Date().toISOString(),
        attributes: [
          {
            trait_type: "Type",
            value: "Virtual NFT"
          },
          {
            trait_type: "Points",
            value: formData.points.toString()
          },
          {
            trait_type: "Reason",
            value: formData.reason
          }
        ]
      };
      
      // Create virtual NFT (stored in teacher's library for later distribution)
      const { data: nft, error: nftError } = await supabase
        .from('nfts')
        .insert({
          token_id: `virtual-${Date.now()}`,
          contract_address: 'virtual-contract',
          metadata,
          creator_wallet_id: teacherWallet.id,
          image_url: imageUrl,
          owner_wallet_id: teacherWallet.id, // Initially owned by teacher
          network: "virtual",
          blockchain_status: "virtual"
        })
        .select()
        .single();

      if (nftError) throw nftError;
      
      toast({
        title: "Virtual NFT Created!",
        description: `${formData.title} has been added to your library!`
      });
      
      // Reset form
      setFormData({ title: "", description: "", points: 100, reason: "" });
      setImageUrl(null);
      
    } catch (error: any) {
      console.error('Error creating virtual NFT:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create virtual NFT",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 glass-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-green-600/20">
            <Trophy className="w-6 h-6 text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold gradient-text">Create Virtual NFT</h2>
          <div className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">
            Test Mode
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Award Title*</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Excellent Participation"
                className="bg-gray-800/50 border-gray-600 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description*</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe why this award is being given..."
                className="bg-gray-800/50 border-gray-600 focus:border-purple-500 min-h-[100px]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <Input
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., Outstanding homework completion"
                className="bg-gray-800/50 border-gray-600 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Points</label>
              <Input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                min="1"
                max="1000"
                className="bg-gray-800/50 border-gray-600 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Award Image</label>
              <NFTImageUpload
                imageUrl={imageUrl}
                onImageSelect={setImageUrl}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading || !formData.title || !formData.description}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ImagePlus className="w-4 h-4 mr-2" />
                Create Virtual NFT
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
