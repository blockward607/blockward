
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NFTCard } from "./NFTCard";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

interface NFT {
  id: string;
  image_url: string | null;
  metadata?: {
    name?: string;
    description?: string;
  };
}

interface StudentNFTSectionProps {
  nfts: NFT[];
  isDemo: boolean;
  onSignUp: () => void;
}

export const StudentNFTSection = ({ nfts, isDemo, onSignUp }: StudentNFTSectionProps) => {
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
  
  const displayNfts = nfts.length > 0 ? nfts : demoNfts;
  
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
      
      {displayNfts.length === 0 ? (
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
};
