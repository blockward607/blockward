
import { Card } from "@/components/ui/card";

interface NFTCardProps {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
}

export const NFTCard = ({ id, imageUrl, name, description }: NFTCardProps) => {
  return (
    <Card key={id} className="p-3 hover:bg-purple-900/10 transition-all">
      <img 
        src={imageUrl || '/placeholder.svg'} 
        alt="NFT" 
        className="w-full h-32 object-cover rounded-md mb-2"
      />
      <p className="font-medium truncate">
        {name || 'Achievement NFT'}
      </p>
      <p className="text-xs text-gray-400 truncate">
        {description || 'Digital achievement'}
      </p>
    </Card>
  );
};
