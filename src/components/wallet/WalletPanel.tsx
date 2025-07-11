
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, ExternalLink, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const WalletPanel = () => {
  const { toast } = useToast();
  const [walletType, setWalletType] = useState<'user' | 'admin'>('user');
  const [isTeacher, setIsTeacher] = useState(false);
  const [nftCount, setNftCount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
    fetchNFTCount();
    fetchWalletDetails();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      
      setIsTeacher(!!teacherProfile);
      setWalletType(!!teacherProfile ? 'admin' : 'user');
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchNFTCount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: walletData } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (walletData) {
        const { count } = await supabase
          .from('nfts')
          .select('*', { count: 'exact', head: true })
          .eq('owner_wallet_id', walletData.id);

        setNftCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching BlockWards count:', error);
    }
  };

  const fetchWalletDetails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (walletData) {
        setAddress(walletData.address);
        
        if (walletType === 'user') {
          const { data: studentData } = await supabase
            .from('students')
            .select('points')
            .eq('user_id', session.user.id)
            .single();
            
          if (studentData) {
            setBalance(studentData.points || 0);
          }
        } else {
          const { data: teacherData } = await supabase
            .from('teacher_profiles')
            .select('remaining_credits')
            .eq('user_id', session.user.id)
            .single();
            
          if (teacherData) {
            setBalance(teacherData.remaining_credits || 1000);
          } else {
            setBalance(1000);
          }
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wallet details:', error);
      setLoading(false);
    }
  };

  const copyAddressToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address).then(() => {
        toast({
          title: "Address Copied",
          description: "Wallet address copied to clipboard"
        });
      }).catch(() => {
        toast({
          variant: "destructive",
          title: "Copy Failed",
          description: "Could not copy address to clipboard"
        });
      });
    }
  };

  const openExternalWalletViewer = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, '_blank');
      toast({
        title: "External Viewer",
        description: "Opening wallet in external viewer"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-purple-400" />
        <div>
          <h3 className="font-semibold">BlockWard Wallet</h3>
          <p className="text-sm text-gray-400">{isTeacher ? 'Teacher Admin Wallet' : 'Student Wallet'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {address && (
          <div className="p-3 bg-purple-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-gray-400">Wallet Address</p>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={copyAddressToClipboard}
                  disabled={!address}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={openExternalWalletViewer}
                  disabled={!address}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="text-sm font-mono truncate">{address}</p>
            <p className="text-xs text-gray-500 mt-1">Use this address to sign in to your account</p>
          </div>
        )}
        
        <div className="p-4 bg-purple-900/20 rounded-lg">
          <div className="flex justify-between mb-2">
            <h4 className="font-medium">Balance</h4>
            <span className="font-bold text-purple-400">{balance} points</span>
          </div>
          <div className="flex justify-between">
            <h4 className="font-medium">BlockWards</h4>
            <span className="font-bold text-purple-400">{nftCount}</span>
          </div>
        </div>
        
        {isTeacher ? (
          <div className="space-y-2">
            <Link to="/wallet">
              <Button variant="outline" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Points & BlockWards
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            <Link to="/wallet">
              <Button className="w-full">
                <Wallet className="w-4 h-4 mr-2" />
                View My BlockWards
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
