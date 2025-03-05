
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Award, Book, ChartBar, Grid, Mail, User, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WalletPanel } from "@/components/wallet/WalletPanel";
import { NFTGrid } from "@/components/wallet/NFTGrid";

const StudentDashboard = () => {
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const [studentPoints, setStudentPoints] = useState<number>(0);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentInfo();
    fetchStudentNFTs();
  }, []);

  const fetchStudentInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get student email
      setStudentEmail(session.user.email);

      // Get student points and name
      const { data: studentData, error } = await supabase
        .from('students')
        .select('points, name')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      setStudentPoints(studentData?.points || 0);
      setStudentName(studentData?.name || 'Student');
    } catch (error) {
      console.error('Error fetching student info:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student information"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentNFTs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get wallet id
      const { data: walletData } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (walletData) {
        // Get NFTs for this wallet
        const { data: nftData } = await supabase
          .from('nfts')
          .select('*')
          .eq('owner_wallet_id', walletData.id)
          .limit(3);

        setNfts(nftData || []);
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Info */}
      <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="p-3 rounded-full bg-purple-600/20">
              <User className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{studentName || 'Welcome'}</h3>
              <p className="text-sm text-gray-400">{studentEmail || 'Loading...'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl text-purple-400">{studentPoints}</span>
            <span className="text-gray-400">points</span>
          </div>
        </div>
      </Card>

      {/* Dashboard Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-purple-600/20">
                <Book className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">My Classes</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">View your enrolled classes and assignments</p>
            <Link to="/classes" className="mt-auto text-purple-400 hover:text-purple-300">
              View classes →
            </Link>
          </div>
        </Card>

        <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-purple-600/20">
                <ChartBar className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">My Progress</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Track your academic progress</p>
            <Link to="/progress" className="mt-auto text-purple-400 hover:text-purple-300">
              View progress →
            </Link>
          </div>
        </Card>

        <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-purple-600/20">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Achievements</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">View your earned achievements and badges</p>
            <Link to="/achievements" className="mt-auto text-purple-400 hover:text-purple-300">
              View achievements →
            </Link>
          </div>
        </Card>
      </div>

      {/* My Wallet */}
      <Card className="p-6 glass-card">
        <h3 className="text-lg font-semibold mb-4">My Wallet</h3>
        <WalletPanel expanded={true} />
      </Card>

      {/* My NFTs */}
      <Card className="p-6 glass-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">My NFT Achievements</h3>
          <Link to="/wallet" className="text-purple-400 hover:text-purple-300 text-sm">
            View all →
          </Link>
        </div>
        
        {nfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {nfts.map((nft) => (
              <Card key={nft.id} className="p-3 hover:bg-purple-900/10 transition-all">
                <img 
                  src={nft.image_url || '/placeholder.svg'} 
                  alt="NFT" 
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <p className="font-medium truncate">
                  {nft.metadata?.name || 'Achievement NFT'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {nft.metadata?.description || 'Digital achievement'}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">You haven't earned any NFT achievements yet.</p>
        )}
      </Card>
    </div>
  );
};

export default StudentDashboard;
