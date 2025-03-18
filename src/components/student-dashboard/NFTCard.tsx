
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Trophy, Award, Star } from "lucide-react";

interface NFTCardProps {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
}

export const NFTCard = ({ id, imageUrl, name, description }: NFTCardProps) => {
  // Choose a random icon for NFTs without images
  const icons = [
    <Trophy className="w-10 h-10 text-purple-400/60" />,
    <Award className="w-10 h-10 text-purple-400/60" />,
    <Star className="w-10 h-10 text-purple-400/60" />
  ];

  const randomIcon = icons[Math.floor(Math.random() * icons.length)];
  
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card key={id} className="p-3 hover:bg-purple-900/10 transition-all overflow-hidden border border-purple-500/20">
        <div className="relative h-32 mb-2 rounded-md overflow-hidden">
          {imageUrl && imageUrl !== '/placeholder.svg' ? (
            <img 
              src={imageUrl} 
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
              {randomIcon}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
            <p className="text-white text-xs font-medium">View details</p>
          </div>
        </div>
        <div>
          <p className="font-medium truncate text-sm">
            {name || 'Achievement NFT'}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {description || 'Digital achievement'}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
