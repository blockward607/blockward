import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NFT } from "./hooks/useStudentData";
import { Skeleton } from "@/components/ui/skeleton";

export interface NFTCardProps {
  nftList?: NFT[];
  isLoading?: boolean;
  id?: string;
  imageUrl?: string;
  name?: string;
  description?: string;
}

export function NFTCard({ 
  nftList, 
  isLoading,
  id,
  imageUrl,
  name,
  description
}: NFTCardProps) {
  if (id && imageUrl) {
    return (
      <div className="space-y-2">
        <img
          src={imageUrl}
          alt={name || "NFT Image"}
          className="rounded-md aspect-square object-cover w-full h-40"
        />
        <div className="text-sm font-medium">{name || "Unnamed NFT"}</div>
        <div className="text-xs text-gray-400">{description || "No description"}</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your NFTs</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : nftList?.length === 0 ? (
          <p className="text-sm text-gray-400">No NFTs in your collection yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nftList?.map((nft) => (
              <div key={nft.id} className="space-y-2">
                <img
                  src={nft.image_url}
                  alt={nft.metadata?.name || "NFT Image"}
                  className="rounded-md aspect-square object-cover w-full h-40"
                />
                <div className="text-sm font-medium">{nft.metadata?.name || "Unnamed NFT"}</div>
                <div className="text-xs text-gray-400">{nft.metadata?.description || "No description"}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
