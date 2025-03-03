
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WalletPanelProps {
  expanded?: boolean;
}

export const WalletPanel = ({ expanded = false }: WalletPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [walletType, setWalletType] = useState<'user' | 'admin'>('user');
  const [isTeacher, setIsTeacher] = useState(false);
  const [nftCount, setNftCount] = useState(0);

  useEffect(() => {
    checkUserRole();
    fetchNFTCount();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

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
      console.error('Error fetching NFT count:', error);
    }
  };

  return (
    <Card className={`glass-card transition-all ${isExpanded ? 'p-6' : 'p-2'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-400" />
          {isExpanded && (
            <div>
              <h3 className="font-semibold">Blockward Wallet</h3>
              <p className="text-sm text-gray-400">{isTeacher ? 'Teacher Admin Wallet' : 'Student Wallet'}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-purple-900/20 rounded-lg">
            <h4 className="font-medium mb-2">Your NFTs</h4>
            {nftCount > 0 ? (
              <p className="text-sm">You have {nftCount} NFTs in your wallet</p>
            ) : (
              <p className="text-sm text-gray-400">No NFTs found in your wallet</p>
            )}
          </div>
          
          {isTeacher && (
            <div className="space-y-2">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Generate NFT
              </Button>
              <Button variant="outline" className="w-full">
                Send NFT
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
