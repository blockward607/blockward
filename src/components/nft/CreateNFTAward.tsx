import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, ImagePlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const CreateNFTAward = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (walletError) throw walletError;

      const metadata = {
        name: formData.title,
        description: formData.description,
        points: formData.points,
        created_at: new Date().toISOString(),
      };

      const { data: nft, error: nftError } = await supabase
        .from('nfts')
        .insert({
          token_id: `award-${Date.now()}`,
          contract_address: "0x" + Math.random().toString(16).slice(2, 42),
          metadata,
          creator_wallet_id: walletData.id,
          network: "testnet",
        })
        .select()
        .single();

      if (nftError) throw nftError;

      toast({
        title: "Success",
        description: "NFT Award created successfully",
      });

      setFormData({ title: "", description: "", points: 100 });
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create NFT Award",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 glass-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-purple-600/20">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-semibold gradient-text">Create NFT Award</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              placeholder="Award Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="glass-input"
            />
          </div>

          <div>
            <Textarea
              placeholder="Award Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input min-h-[100px]"
            />
          </div>

          <div>
            <Input
              type="number"
              placeholder="Points Value"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
              className="glass-input"
            />
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ImagePlus className="w-4 h-4 mr-2" />
                  Create NFT Award
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};