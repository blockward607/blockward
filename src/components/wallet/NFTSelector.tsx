
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NFT } from "@/hooks/useTransferData";
import { Award } from "lucide-react";
import { useState } from "react";

interface NFTSelectorProps {
  nfts: NFT[];
  selectedNft: string;
  setSelectedNft: (value: string) => void;
  loading: boolean;
  disabled: boolean;
}

export const NFTSelector = ({
  nfts,
  selectedNft,
  setSelectedNft,
  loading,
  disabled
}: NFTSelectorProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const nftId = e.dataTransfer.getData("nft-id");
    if (nftId) {
      setSelectedNft(nftId);
    }
  };

  const selectedNftName = () => {
    const nft = nfts.find(n => n.id === selectedNft);
    if (!nft) return "Select a BlockWard";
    
    const metadata = typeof nft.metadata === 'string' 
      ? JSON.parse(nft.metadata) 
      : nft.metadata;
    return metadata.name || `BlockWard #${nft.id.substring(0, 4)}`;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="nft" className="flex items-center gap-2">
        <Award className="h-4 w-4 text-purple-400" />
        <span>Select BlockWard</span>
      </Label>
      
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragOver 
            ? 'border-purple-400 bg-purple-400/10' 
            : 'border-gray-600 bg-gray-800/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400 mb-2">
            {isDragOver ? "Drop NFT here" : "Drag an NFT from your library or select below"}
          </p>
          {selectedNft && (
            <p className="text-sm text-purple-300 font-medium">
              Selected: {selectedNftName()}
            </p>
          )}
        </div>
      </div>

      {/* Traditional Select Fallback */}
      <Select 
        value={selectedNft} 
        onValueChange={setSelectedNft}
        disabled={loading || disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Or select from dropdown" />
        </SelectTrigger>
        <SelectContent>
          {nfts.length === 0 ? (
            <SelectItem value="no-nfts" disabled>
              No available BlockWards
            </SelectItem>
          ) : (
            nfts.map((nft) => {
              const metadata = typeof nft.metadata === 'string' 
                ? JSON.parse(nft.metadata) 
                : nft.metadata;
              return (
                <SelectItem key={nft.id} value={nft.id}>
                  {metadata.name || `BlockWard #${nft.id.substring(0, 4)}`}
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
