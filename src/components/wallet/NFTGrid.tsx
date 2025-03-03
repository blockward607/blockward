
import { AlertCircle, Medal, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NFTMetadata {
  name: string;
  description: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFT {
  id: string;
  metadata: NFTMetadata;
  image_url: string | null;
  created_at: string;
}

interface NFTGridProps {
  nfts: NFT[];
  isLoading: boolean;
}

export const NFTGrid = ({ nfts, isLoading }: NFTGridProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading your NFTs...</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No NFTs Found</h3>
        <p className="text-gray-400 mb-4">You haven't received any NFT rewards yet.</p>
        <p className="text-sm text-gray-500">Complete achievements and assignments to earn NFT rewards!</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {nfts.map((nft) => (
        <NFTCard key={nft.id} nft={nft} />
      ))}
    </div>
  );
};

interface NFTCardProps {
  nft: NFT;
}

const NFTCard = ({ nft }: NFTCardProps) => {
  return (
    <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-purple-900/20 relative">
        {nft.image_url ? (
          <img 
            src={nft.image_url} 
            alt={nft.metadata.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Medal className="w-16 h-16 text-purple-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-purple-800 text-white text-xs px-2 py-1 rounded-full">
          NFT
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold">{nft.metadata.name || `NFT #${nft.id.substring(0, 4)}`}</h3>
          <Tag className="w-4 h-4 text-purple-400" />
        </div>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{nft.metadata.description || "Educational achievement NFT"}</p>
        <div className="mt-2 flex gap-1 flex-wrap">
          {nft.metadata.attributes?.slice(0, 2).map((attr, index) => (
            <span key={index} className="text-xs bg-purple-900/30 px-2 py-1 rounded">
              {attr.trait_type}: {attr.value}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};
