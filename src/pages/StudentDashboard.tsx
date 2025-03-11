
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Book, ChartBar, Grid, Mail, User, Wallet, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WalletPanel } from "@/components/wallet/WalletPanel";
import { NFTGrid } from "@/components/wallet/NFTGrid";
import { JoinClassSection } from "@/components/classroom/JoinClassSection";
import { motion } from "framer-motion";

const StudentDashboard = () => {
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const [studentPoints, setStudentPoints] = useState<number>(0);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        await fetchStudentInfo();
        await fetchStudentNFTs();
      } else {
        // Check if this is a demo view
        const path = window.location.pathname;
        if (path === '/view-student-dashboard') {
          setIsDemo(true);
          // Load some demo data
          setStudentName('Demo Student');
          setStudentEmail('demo@example.com');
          setStudentPoints(150);
          setNfts([
            {
              id: '1',
              image_url: '/placeholder.svg',
              metadata: {
                name: 'Perfect Attendance',
                description: 'Attended all classes for a month'
              }
            },
            {
              id: '2',
              image_url: '/placeholder.svg',
              metadata: {
                name: 'Math Wizard',
                description: 'Completed all advanced math assignments'
              }
            }
          ]);
        }
      }
      setLoading(false);
    };

    checkAuth();
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

  const handleSignUp = () => {
    navigate('/auth');
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

      {/* Demo Banner (only shown in demo mode) */}
      {isDemo && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 glass-card bg-gradient-to-r from-purple-900/30 to-indigo-900/30 text-center"
        >
          <h2 className="text-xl font-bold mb-3 gradient-text">You're viewing the Student Demo</h2>
          <p className="text-gray-300 mb-4">
            This is a preview of the Blockward student dashboard. Sign up to access all features and start earning rewards!
          </p>
          <Button
            onClick={handleSignUp}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
          >
            Sign Up Now <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      )}

      {/* Join Class Section (only for authenticated non-demo users) */}
      {isAuthenticated && !isDemo && (
        <JoinClassSection />
      )}

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
            <Link to={isDemo ? "/auth" : "/classes"} className="mt-auto text-purple-400 hover:text-purple-300">
              {isDemo ? "Sign up to access" : "View classes"} →
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
            <Link to={isDemo ? "/auth" : "/progress"} className="mt-auto text-purple-400 hover:text-purple-300">
              {isDemo ? "Sign up to access" : "View progress"} →
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
            <Link to={isDemo ? "/auth" : "/achievements"} className="mt-auto text-purple-400 hover:text-purple-300">
              {isDemo ? "Sign up to access" : "View achievements"} →
            </Link>
          </div>
        </Card>
      </div>

      {/* My Wallet */}
      <Card className="p-6 glass-card">
        <h3 className="text-lg font-semibold mb-4">My Wallet</h3>
        {isDemo ? (
          <div className="text-center py-4">
            <p className="text-gray-400 mb-4">Sign up to access your blockchain wallet and NFT collection.</p>
            <Button
              onClick={handleSignUp}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
            >
              Create Account
            </Button>
          </div>
        ) : (
          <WalletPanel expanded={true} />
        )}
      </Card>

      {/* My NFTs */}
      <Card className="p-6 glass-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">My NFT Achievements</h3>
          <Link to={isDemo ? "/auth" : "/wallet"} className="text-purple-400 hover:text-purple-300 text-sm">
            {isDemo ? "Sign up to view all" : "View all"} →
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
