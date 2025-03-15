
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NFTCard } from "./NFTCard";

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
  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">My NFT Achievements</h3>
        <Link to={isDemo ? "/auth" : "/wallet"} className="text-purple-400 hover:text-purple-300 text-sm">
          {isDemo ? "Sign up to view all" : "View all"} →
        </Link>
      </div>
      
      {isDemo && nfts.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-400 mb-4">Sign up to start earning NFT achievements for your academic success.</p>
          <Button
            onClick={onSignUp}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
          >
            Create Account
          </Button>
        </div>
      ) : nfts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {nfts.map((nft) => (
            <NFTCard 
              key={nft.id}
              id={nft.id}
              imageUrl={nft.image_url || '/placeholder.svg'}
              name={nft.metadata?.name || 'Achievement NFT'}
              description={nft.metadata?.description || 'Digital achievement'}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-400">You haven't earned any NFT achievements yet.</p>
      )}
    </Card>
  );
};
