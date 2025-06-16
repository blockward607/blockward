
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlockchainNFT {
  id: string;
  metadata: {
    name: string;
    description: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  image_url: string | null;
  blockchain_token_id: number | null;
  transaction_hash: string | null;
  blockchain_status: string;
  minted_at: string | null;
  created_at: string;
}

interface BlockchainNFTGridProps {
  nfts: BlockchainNFT[];
  isLoading: boolean;
  userRole: 'teacher' | 'student' | null;
}

export const BlockchainNFTGrid = ({ nfts, isLoading, userRole }: BlockchainNFTGridProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'minted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const openTransaction = (txHash: string | null) => {
    if (txHash && !txHash.startsWith('sim-')) {
      window.open(`https://mumbai.polygonscan.com/tx/${txHash}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-purple-500/20 animate-pulse">
            <CardContent className="p-4">
              <div className="aspect-square bg-gray-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-purple-300 mb-2">
            {userRole === 'teacher' ? 'No NFTs Created' : 'No NFTs Received'}
          </h3>
          <p className="text-gray-400">
            {userRole === 'teacher' 
              ? 'Start creating blockchain NFT awards for your students!'
              : 'Complete achievements to earn blockchain NFT certificates!'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nfts.map((nft) => (
        <Card key={nft.id} className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 hover:shadow-lg hover:shadow-purple-500/20 transition-all">
          <CardContent className="p-4">
            <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
              {nft.image_url ? (
                <img 
                  src={nft.image_url} 
                  alt={nft.metadata.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Trophy className="h-16 w-16 text-purple-400" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-purple-200 line-clamp-2 flex-1">
                  {nft.metadata.name}
                </h3>
                <Badge className={`ml-2 text-xs ${getStatusColor(nft.blockchain_status)}`}>
                  {nft.blockchain_status}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-400 line-clamp-2">
                {nft.metadata.description}
              </p>
              
              {nft.metadata.attributes && (
                <div className="flex flex-wrap gap-1">
                  {nft.metadata.attributes.slice(0, 2).map((attr, i) => (
                    <Badge key={i} variant="outline" className="text-xs border-purple-500/30">
                      {attr.trait_type}: {attr.value}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {nft.minted_at 
                      ? new Date(nft.minted_at).toLocaleDateString()
                      : new Date(nft.created_at).toLocaleDateString()
                    }
                  </span>
                </div>
                
                {nft.transaction_hash && !nft.transaction_hash.startsWith('sim-') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openTransaction(nft.transaction_hash)}
                    className="h-6 px-2 text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Tx
                  </Button>
                )}
              </div>
              
              {nft.blockchain_token_id && (
                <div className="text-xs text-purple-400 font-mono">
                  Token #{nft.blockchain_token_id}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
