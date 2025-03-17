
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface NFTCardProps {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
}

export const NFTCard = ({ id, imageUrl, name, description }: NFTCardProps) => {
  return (
    <Card key={id} className="p-3 hover:bg-purple-900/10 transition-all group overflow-hidden">
      <div className="h-32 overflow-hidden rounded-md mb-2 bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
        {imageUrl && imageUrl !== '/placeholder.svg' ? (
          <img 
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover rounded-md group-hover:scale-110 transition-transform"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Trophy className="w-10 h-10 text-purple-400/60" />
          </div>
        )}
      </div>
      <p className="font-medium truncate">
        {name || 'BlockWard Achievement'}
      </p>
      <p className="text-xs text-gray-400 truncate">
        {description || 'Educational achievement'}
      </p>
    </Card>
  );
};
