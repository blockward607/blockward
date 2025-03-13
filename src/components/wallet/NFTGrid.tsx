
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Trophy, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <Card className="p-6 text-center bg-purple-900/10">
        <Trophy className="mx-auto h-10 w-10 text-purple-400 mb-2 opacity-50" />
        <h3 className="text-lg font-medium mb-1">No BlockWards Yet</h3>
        <p className="text-sm text-gray-400">
          You haven't earned any BlockWards yet. Complete tasks and achievements to earn them!
        </p>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nfts.map((nft) => (
          <Dialog key={nft.id}>
            <DialogTrigger asChild>
              <Card 
                className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
                onClick={() => setSelectedNFT(nft)}
              >
                <div className="relative h-48 overflow-hidden">
                  {nft.image_url || nft.metadata.image ? (
                    <img 
                      src={nft.image_url || nft.metadata.image}
                      alt={nft.metadata.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20">
                      <Trophy className="h-16 w-16 text-purple-500/60" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {nft.metadata.name}
                    </h3>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {nft.metadata.description}
                  </p>
                  <div className="flex justify-between items-center pt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(nft.created_at)}</span>
                    </div>
                    {nft.metadata.attributes?.find(a => a.trait_type === "Points") && (
                      <div className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 font-medium">
                        {nft.metadata.attributes.find(a => a.trait_type === "Points")?.value || "0"} Points
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>BlockWard Details</DialogTitle>
              </DialogHeader>
              {selectedNFT && selectedNFT.id === nft.id && (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden h-60">
                    {nft.image_url || nft.metadata.image ? (
                      <img 
                        src={nft.image_url || nft.metadata.image}
                        alt={nft.metadata.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20">
                        <Trophy className="h-20 w-20 text-purple-500/60" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{nft.metadata.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{nft.metadata.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {nft.metadata.attributes?.map((attr, i) => (
                        <div key={i} className="bg-purple-900/10 rounded-lg p-2">
                          <p className="text-xs text-gray-400">{attr.trait_type}</p>
                          <p className="font-medium">{attr.value}</p>
                        </div>
                      ))}
                      <div className="bg-purple-900/10 rounded-lg p-2">
                        <p className="text-xs text-gray-400">Issued On</p>
                        <p className="font-medium">{formatDate(nft.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </>
  );
};
