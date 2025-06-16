
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Trash2, Send, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StudentSelect } from "./StudentSelect";

interface TeacherNFT {
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
  created_at: string;
}

export const TeacherNFTLibrary = () => {
  const { toast } = useToast();
  const [nfts, setNfts] = useState<TeacherNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNft, setSelectedNft] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    loadTeacherNFTs();
  }, []);

  const loadTeacherNFTs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get teacher's wallet
      const { data: teacherWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (teacherWallet) {
        const { data: nftData, error } = await supabase
          .from('nfts')
          .select(`
            id,
            metadata,
            image_url,
            blockchain_token_id,
            transaction_hash,
            blockchain_status,
            created_at
          `)
          .eq('creator_wallet_id', teacherWallet.id)
          .eq('owner_wallet_id', teacherWallet.id) // Only show NFTs still owned by teacher
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedNfts: TeacherNFT[] = (nftData || []).map((nft: any) => {
          const parsedMetadata = typeof nft.metadata === 'string' 
            ? JSON.parse(nft.metadata) 
            : nft.metadata;
            
          return {
            id: nft.id,
            metadata: {
              name: parsedMetadata.name || `BlockWard #${nft.id.substring(0, 4)}`,
              description: parsedMetadata.description || "Educational achievement award",
              image: parsedMetadata.image,
              attributes: parsedMetadata.attributes || []
            },
            image_url: nft.image_url,
            blockchain_token_id: nft.blockchain_token_id,
            transaction_hash: nft.transaction_hash,
            blockchain_status: nft.blockchain_status || 'pending',
            created_at: nft.created_at
          };
        });

        setNfts(transformedNfts);
      }
    } catch (error) {
      console.error('Error loading teacher NFTs:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your NFT library"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNFT = async (nftId: string) => {
    try {
      const { error } = await supabase
        .from('nfts')
        .delete()
        .eq('id', nftId);

      if (error) throw error;

      toast({
        title: "NFT Deleted",
        description: "The BlockWard has been permanently deleted"
      });

      // Reload the list
      loadTeacherNFTs();
    } catch (error: any) {
      console.error('Error deleting NFT:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Failed to delete the BlockWard"
      });
    }
  };

  const handleTransferNFT = async () => {
    if (!selectedNft || !selectedStudent) return;

    setTransferring(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Get student's wallet
      const { data: studentWallet, error: walletError } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', selectedStudent)
        .single();

      if (walletError || !studentWallet) {
        throw new Error("Student wallet not found");
      }

      // Update NFT owner
      const { error: updateError } = await supabase
        .from('nfts')
        .update({ owner_wallet_id: studentWallet.id })
        .eq('id', selectedNft);

      if (updateError) throw updateError;

      // Create transaction record
      const { data: teacherWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (teacherWallet) {
        await supabase.from('transactions').insert({
          nft_id: selectedNft,
          from_wallet_id: teacherWallet.id,
          to_wallet_id: studentWallet.id,
          transaction_hash: `transfer_${Date.now()}`,
          status: 'completed'
        });
      }

      // Award points to student if NFT has points
      const nft = nfts.find(n => n.id === selectedNft);
      const pointsAttribute = nft?.metadata.attributes?.find(a => a.trait_type === "Points");
      if (pointsAttribute) {
        const points = parseInt(pointsAttribute.value);
        if (!isNaN(points)) {
          await supabase.rpc('increment_student_points', {
            student_id: selectedStudent,
            points_to_add: points
          });
        }
      }

      toast({
        title: "NFT Transferred",
        description: "The BlockWard has been sent to the student successfully!"
      });

      setSelectedNft(null);
      setSelectedStudent("");
      loadTeacherNFTs();
    } catch (error: any) {
      console.error('Error transferring NFT:', error);
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error.message || "Failed to transfer the BlockWard"
      });
    } finally {
      setTransferring(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'minted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
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
            No NFTs in Library
          </h3>
          <p className="text-gray-400">
            Create blockchain NFT awards to build your library!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nfts.map((nft) => (
        <Card key={nft.id} className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
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
            
            <div className="space-y-3">
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
              
              <div className="flex items-center gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedNft(nft.id)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Send
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send BlockWard to Student</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="font-medium text-purple-200">{nft.metadata.name}</div>
                      <StudentSelect
                        selectedStudentId={selectedStudent}
                        onStudentSelect={setSelectedStudent}
                        placeholder="Select student to receive this award"
                      />
                      <Button 
                        onClick={handleTransferNFT}
                        disabled={!selectedStudent || transferring}
                        className="w-full"
                      >
                        {transferring ? "Sending..." : "Send BlockWard"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        Delete BlockWard
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to permanently delete "{nft.metadata.name}"? 
                        This action cannot be undone and the NFT will be lost forever.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDeleteNFT(nft.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
