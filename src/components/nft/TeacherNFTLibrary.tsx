
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StudentSelect } from "./StudentSelect";

interface NFT {
  id: string;
  metadata: any;
  image_url: string | null;
  created_at: string;
}

export const TeacherNFTLibrary = () => {
  const { toast } = useToast();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferLoading, setTransferLoading] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedNft, setSelectedNft] = useState<string>("");

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
        // Load NFTs created by this teacher and still in their possession
        const { data: nftData, error } = await supabase
          .from('nfts')
          .select('*')
          .eq('creator_wallet_id', teacherWallet.id)
          .eq('owner_wallet_id', teacherWallet.id) // Only show NFTs still owned by teacher
          .order('created_at', { ascending: false });

        if (error) throw error;

        setNfts(nftData || []);
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

  const handleTransferNFT = async () => {
    if (!selectedNft || !selectedStudent) {
      toast({
        variant: "destructive",
        title: "Missing Selection",
        description: "Please select both an NFT and a student"
      });
      return;
    }

    setTransferLoading(selectedNft);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Get or create student wallet
      let studentWallet;
      const { data: existingWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', selectedStudent)
        .single();
        
      if (existingWallet) {
        studentWallet = existingWallet;
      } else {
        // Create a wallet for the student
        const { data: newWallet, error: createWalletError } = await supabase
          .from('wallets')
          .insert({
            user_id: selectedStudent,
            address: "wallet_" + Math.random().toString(16).slice(2, 10),
            type: "user"
          })
          .select()
          .single();
          
        if (createWalletError) throw createWalletError;
        studentWallet = newWallet;
      }

      // Get teacher wallet
      const { data: teacherWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (!teacherWallet) throw new Error("Teacher wallet not found");

      // Transfer NFT ownership
      const { error: transferError } = await supabase
        .from('nfts')
        .update({ owner_wallet_id: studentWallet.id })
        .eq('id', selectedNft)
        .eq('owner_wallet_id', teacherWallet.id); // Ensure teacher owns it

      if (transferError) throw transferError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          nft_id: selectedNft,
          from_wallet_id: teacherWallet.id,
          to_wallet_id: studentWallet.id,
          transaction_hash: "virtual-transfer-" + Date.now(),
          status: 'completed',
        });

      if (transactionError) throw transactionError;

      // Award points to student
      const nft = nfts.find(n => n.id === selectedNft);
      const points = nft?.metadata?.points || 100;

      const { error: incrementError } = await supabase
        .rpc('increment_student_points', {
          student_id: selectedStudent,
          points_to_add: points
        });

      if (incrementError) {
        console.warn('Failed to increment student points:', incrementError);
      }

      toast({
        title: "NFT Transferred!",
        description: "The BlockWard has been successfully sent to the student!"
      });

      // Reset selections and reload library
      setSelectedNft("");
      setSelectedStudent("");
      loadTeacherNFTs();

    } catch (error: any) {
      console.error('Error transferring NFT:', error);
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: error.message || "Failed to transfer NFT"
      });
    } finally {
      setTransferLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-purple-600/20">
          <Trophy className="w-6 h-6 text-purple-400" />
        </div>
        <h2 className="text-2xl font-semibold gradient-text">My Library</h2>
      </div>

      {nfts.length === 0 ? (
        <Card className="p-6 text-center bg-gradient-to-br from-purple-900/10 to-indigo-900/10 border-purple-500/20">
          <Trophy className="mx-auto h-12 w-12 text-purple-400 mb-3 opacity-60" />
          <h3 className="text-xl font-medium mb-2">No NFTs in Library</h3>
          <p className="text-sm text-gray-400">
            Create your first Virtual NFT to build your library!
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft) => {
              const metadata = typeof nft.metadata === 'string' 
                ? JSON.parse(nft.metadata) 
                : nft.metadata;
              
              return (
                <Card 
                  key={nft.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg border-purple-500/20 ${
                    selectedNft === nft.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedNft(selectedNft === nft.id ? "" : nft.id)}
                >
                  <div className="relative h-48 overflow-hidden">
                    {nft.image_url ? (
                      <img 
                        src={nft.image_url}
                        alt={metadata.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-600/20 via-indigo-600/20 to-purple-600/20">
                        <Trophy className="h-16 w-16 text-purple-500/60" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-semibold">{metadata.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{metadata.description}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-purple-400">
                        {metadata.points} Points
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(nft.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {selectedNft && (
            <Card className="p-6 bg-purple-900/10 border-purple-500/20">
              <h3 className="text-lg font-semibold mb-4">Send NFT to Student</h3>
              <div className="space-y-4">
                <StudentSelect
                  selectedStudentId={selectedStudent}
                  onStudentSelect={setSelectedStudent}
                  placeholder="Choose a student to receive this NFT"
                />
                <Button
                  onClick={handleTransferNFT}
                  disabled={!selectedStudent || transferLoading === selectedNft}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {transferLoading === selectedNft ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send BlockWard
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
