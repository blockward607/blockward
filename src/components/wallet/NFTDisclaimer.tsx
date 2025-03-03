
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

export const NFTDisclaimer = () => {
  return (
    <Card className="p-4 border border-yellow-600/30 bg-yellow-950/20">
      <div className="flex gap-4">
        <AlertTriangle className="w-10 h-10 text-yellow-400 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-yellow-300">NFT Ownership</h3>
          <p className="text-sm text-gray-300">
            NFTs in this wallet represent academic achievements and rewards. 
            These digital certificates are stored on a private blockchain for educational purposes.
          </p>
        </div>
      </div>
    </Card>
  );
};
