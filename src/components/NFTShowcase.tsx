import { motion } from "framer-motion";
import { Sparkles, Trophy, Star, Medal, Crown, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const nfts = [
  {
    title: "Academic Excellence Trophy",
    description: "Awarded for outstanding academic achievement",
    icon: Trophy,
    gradient: "from-yellow-400 to-orange-500",
    points: 1000,
  },
  {
    title: "Innovation Star",
    description: "Recognition for creative thinking and innovation",
    icon: Star,
    gradient: "from-purple-400 to-pink-500",
    points: 750,
  },
  {
    title: "Leadership Crown",
    description: "Awarded for exceptional leadership qualities",
    icon: Crown,
    gradient: "from-blue-400 to-cyan-500",
    points: 850,
  },
  {
    title: "STEM Excellence",
    description: "Outstanding achievement in Science and Technology",
    icon: Brain,
    gradient: "from-green-400 to-emerald-500",
    points: 900,
  },
  {
    title: "Sports Champion",
    description: "Excellence in athletic performance",
    icon: Medal,
    gradient: "from-red-400 to-rose-500",
    points: 800,
  },
  {
    title: "Special Achievement",
    description: "Recognition for exceptional accomplishment",
    icon: Sparkles,
    gradient: "from-indigo-400 to-violet-500",
    points: 700,
  },
];

export const NFTShowcase = () => {
  const { toast } = useToast();
  const [transferring, setTransferring] = useState<string | null>(null);

  const transferNFT = async (nft: typeof nfts[0], studentId: string) => {
    try {
      setTransferring(nft.title);
      
      // Get teacher's wallet
      const { data: teacherWallet, error: teacherWalletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', (await supabase.auth.getSession()).data.session?.user.id)
        .maybeSingle();

      if (teacherWalletError) throw teacherWalletError;
      if (!teacherWallet) {
        // Create teacher wallet if it doesn't exist
        const { data: newTeacherWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            user_id: (await supabase.auth.getSession()).data.session?.user.id,
            address: "0x" + Math.random().toString(16).slice(2, 42),
            type: "admin"
          })
          .select()
          .single();

        if (createError) throw createError;
        if (!newTeacherWallet) throw new Error('Failed to create teacher wallet');
        
        teacherWallet = newTeacherWallet;
      }

      // Get student's wallet
      const { data: studentWallet, error: studentWalletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', studentId)
        .maybeSingle();

      if (studentWalletError) throw studentWalletError;
      if (!studentWallet) throw new Error('Student wallet not found');

      // Create NFT
      const { data: nftData, error: nftError } = await supabase
        .from('nfts')
        .insert({
          token_id: `award-${Date.now()}`,
          contract_address: "0x" + Math.random().toString(16).slice(2, 42),
          metadata: {
            name: nft.title,
            description: nft.description,
            points: nft.points,
            created_at: new Date().toISOString(),
          },
          creator_wallet_id: teacherWallet.id,
          owner_wallet_id: studentWallet.id,
          network: "testnet",
        })
        .select()
        .single();

      if (nftError) throw nftError;

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          nft_id: nftData.id,
          from_wallet_id: teacherWallet.id,
          to_wallet_id: studentWallet.id,
          transaction_hash: "0x" + Math.random().toString(16).slice(2, 62),
          status: 'completed',
        });

      toast({
        title: "Success",
        description: `${nft.title} has been transferred successfully!`,
      });
    } catch (error) {
      console.error('Error transferring NFT:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to transfer NFT",
      });
    } finally {
      setTransferring(null);
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(155,135,245,0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative">
        <motion.h2 
          className="text-4xl font-bold text-center mb-12 gradient-text"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          NFT Awards Collection
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {nfts.map((nft, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="glass-card p-8 text-center group cursor-pointer"
            >
              <motion.div 
                className={`w-24 h-24 rounded-full bg-gradient-to-r ${nft.gradient} mx-auto mb-6 p-5 group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <nft.icon className="w-full h-full text-white" />
              </motion.div>
              
              <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors duration-300">
                {nft.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {nft.description}
              </p>
              <p className="text-sm text-purple-400 mt-2">
                {nft.points} points
              </p>

              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  className="w-full"
                  disabled={transferring === nft.title}
                  onClick={() => transferNFT(nft, "student-id")} // Replace with actual student selection
                >
                  {transferring === nft.title ? "Transferring..." : "Transfer NFT"}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};