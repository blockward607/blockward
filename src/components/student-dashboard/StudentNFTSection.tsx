
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NFTCard } from "./NFTCard";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NFT {
  id: string;
  image_url: string | null;
  metadata?: {
    name?: string;
    description?: string;
  };
}

interface StudentNFTSectionProps {
  nfts?: NFT[];
  isDemo: boolean;
  onSignUp: () => void;
}

export const StudentNFTSection = ({ nfts: propNfts, isDemo, onSignUp }: StudentNFTSectionProps) => {
  const [studentNFTs, setStudentNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isDemo) {
      loadStudentNFTs();
    } else {
      setLoading(false);
    }
  }, [isDemo]);

  const loadStudentNFTs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

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
          .order('created_at', { ascending: false })
          .limit(3); // Show only first 3 for preview

        if (error) throw error;

        const transformedNfts: NFT[] = (nftData || []).map((nft: any) => {
          const parsedMetadata = typeof nft.metadata === 'string' 
            ? JSON.parse(nft.metadata) 
            : nft.metadata;
            
          return {
            id: nft.id,
            image_url: nft.image_url,
            metadata: {
              name: parsedMetadata.name || `BlockWard #${nft.id.substring(0, 4)}`,
              description: parsedMetadata.description || "Educational achievement award"
            }
          };
        });

        setStudentNFTs(transformedNfts);
      }
    } catch (error) {
      console.error('Error loading student NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes, show some high-quality demo NFTs
  const demoNfts = isDemo ? [
    {
      id: 'demo-1',
      image_url: 'https://images.unsplash.com/photo-1607462525137-6ec8b5a75920?q=80&w=2127&auto=format&fit=crop',
      metadata: {
        name: 'Academic Excellence',
        description: 'Outstanding achievement in academics'
      }
    },
    {
      id: 'demo-2',
      image_url: 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?q=80&w=2070&auto=format&fit=crop',
      metadata: {
        name: 'Innovation Star',
        description: 'Exceptional creative thinking'
      }
    },
    {
      id: 'demo-3',
      image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop',
      metadata: {
        name: 'Leadership Award',
        description: 'Recognizing outstanding leadership qualities'
      }
    }
  ] : [];
  
  const displayNfts = propNfts || (isDemo ? demoNfts : studentNFTs);
  
  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">My NFT Achievements</h3>
        </div>
        <Link to={isDemo ? "/auth" : "/wallet"} className="text-purple-400 hover:text-purple-300 text-sm">
          {isDemo ? "Sign up to view all" : "View all"} →
        </Link>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="h-40 bg-gray-700 rounded-md"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : displayNfts.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-400 mb-4">
            {isDemo 
              ? "Sign up to start earning NFT achievements for your academic success."
              : "You haven't earned any NFT achievements yet."
            }
          </p>
          {isDemo && (
            <Button
              onClick={onSignUp}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
            >
              Create Account
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {displayNfts.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NFTCard 
                id={nft.id}
                imageUrl={nft.image_url || '/placeholder.svg'}
                name={nft.metadata?.name || 'Achievement NFT'}
                description={nft.metadata?.description || 'Digital achievement'}
              />
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
