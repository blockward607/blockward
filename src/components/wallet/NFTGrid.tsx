
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Trophy, Calendar, Award, Star, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

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
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      setUserRole(roleData?.role as 'teacher' | 'student');
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  // Demo NFTs with high-quality images for students who don't have any yet
  const demoNfts = nfts.length === 0 && !isLoading && userRole === 'student' ? [
    {
      id: 'demo-1',
      metadata: {
        name: 'Academic Excellence',
        description: 'Outstanding achievement in academics. This award recognizes your exceptional dedication to learning and academic growth.',
        attributes: [
          { trait_type: 'Type', value: 'Academic' },
          { trait_type: 'Points', value: '500' },
          { trait_type: 'Rarity', value: 'Rare' }
        ]
      },
      image_url: 'https://images.unsplash.com/photo-1607462525137-6ec8b5a75920?q=80&w=2127&auto=format&fit=crop',
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-2',
      metadata: {
        name: 'Innovation Star',
        description: 'Exceptional creative thinking and problem-solving skills demonstrated in your project work and classroom participation.',
        attributes: [
          { trait_type: 'Type', value: 'Innovation' },
          { trait_type: 'Points', value: '750' },
          { trait_type: 'Rarity', value: 'Epic' }
        ]
      },
      image_url: 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?q=80&w=2070&auto=format&fit=crop',
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-3',
      metadata: {
        name: 'Leadership Award',
        description: 'Recognizing your outstanding leadership qualities and positive influence on peers in group settings.',
        attributes: [
          { trait_type: 'Type', value: 'Leadership' },
          { trait_type: 'Points', value: '600' },
          { trait_type: 'Rarity', value: 'Uncommon' }
        ]
      },
      image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop',
      created_at: new Date().toISOString()
    }
  ] : nfts;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden border-purple-500/20">
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

  if (demoNfts.length === 0) {
    return (
      <Card className="p-6 text-center bg-gradient-to-br from-purple-900/10 to-indigo-900/10 border-purple-500/20">
        <Trophy className="mx-auto h-12 w-12 text-purple-400 mb-3 opacity-60" />
        <h3 className="text-xl font-medium mb-2">No BlockWards Yet</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          {userRole === 'student' 
            ? "You haven't earned any BlockWards yet. Complete tasks and achievements to earn digital recognition of your educational progress!"
            : "No NFTs in your library yet. Create some BlockWard awards to build your collection!"
          }
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

  // Array of different icons for visual variety
  const icons = [
    <Trophy className="h-16 w-16 text-purple-500/60" />,
    <Award className="h-16 w-16 text-purple-500/60" />,
    <Star className="h-16 w-16 text-purple-500/60" />,
    <Tag className="h-16 w-16 text-purple-500/60" />
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoNfts.map((nft, index) => (
          <Dialog key={nft.id}>
            <DialogTrigger asChild>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-purple-500/20 group"
                  onClick={() => setSelectedNFT(nft)}
                >
                  <div className="relative h-48 overflow-hidden">
                    {nft.image_url || nft.metadata.image ? (
                      <img 
                        src={nft.image_url || nft.metadata.image}
                        alt={nft.metadata.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-600/20 via-indigo-600/20 to-purple-600/20">
                        {icons[index % icons.length]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 transform transition-transform duration-300">
                      <h3 className="text-lg font-semibold text-white">
                        {nft.metadata.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 bg-gradient-to-br from-purple-900/5 to-indigo-900/5">
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
              </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-gradient-to-br from-[#25293A] to-[#1D2032] border border-purple-500/30">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-purple-400" />
                  BlockWard Details
                </DialogTitle>
              </DialogHeader>
              {selectedNFT && selectedNFT.id === nft.id && (
                <div className="space-y-6">
                  <div className="relative rounded-lg overflow-hidden h-60 bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
                    {nft.image_url || nft.metadata.image ? (
                      <img 
                        src={nft.image_url || nft.metadata.image}
                        alt={nft.metadata.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {icons[index % icons.length]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{nft.metadata.name}</h3>
                    <p className="text-gray-400">{nft.metadata.description}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      {nft.metadata.attributes?.map((attr, i) => (
                        <div key={i} className="bg-purple-900/10 backdrop-blur-sm rounded-lg p-3 border border-purple-500/10">
                          <p className="text-xs text-gray-400 mb-1">{attr.trait_type}</p>
                          <p className="font-medium">{attr.value}</p>
                        </div>
                      ))}
                      <div className="bg-purple-900/10 backdrop-blur-sm rounded-lg p-3 border border-purple-500/10">
                        <p className="text-xs text-gray-400 mb-1">Issued On</p>
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
