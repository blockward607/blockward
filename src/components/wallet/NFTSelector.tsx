
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
  return (
    <div className="space-y-2">
      <Label htmlFor="nft" className="flex items-center gap-2">
        <Award className="h-4 w-4 text-purple-400" />
        <span>Select BlockWard</span>
      </Label>
      <Select 
        value={selectedNft} 
        onValueChange={setSelectedNft}
        disabled={loading || disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a BlockWard" />
        </SelectTrigger>
        <SelectContent>
          {nfts.length === 0 ? (
            <SelectItem value="none" disabled>
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
