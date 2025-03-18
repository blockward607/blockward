
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown, ChevronUp, Plus, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface WalletPanelProps {
  expanded?: boolean;
}

export const WalletPanel = ({ expanded = false }: WalletPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [walletType, setWalletType] = useState<'user' | 'admin'>('user');
  const [isTeacher, setIsTeacher] = useState(false);
  const [nftCount, setNftCount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    checkUserRole();
    fetchNFTCount();
    fetchWalletDetails();
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
      console.error('Error fetching BlockWards count:', error);
    }
  };

  const fetchWalletDetails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (walletData) {
        setAddress(walletData.address);
        // For a real app, we would fetch the actual balance here
        setBalance(Math.floor(Math.random() * 1000));
      }
    } catch (error) {
      console.error('Error fetching wallet details:', error);
    }
  };

  return (
    <Card className={`glass-card transition-all ${isExpanded ? 'p-6' : 'p-2'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-400" />
          {isExpanded && (
            <div>
              <h3 className="font-semibold">BlockWard Wallet</h3>
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
          {address && (
            <div className="p-3 bg-purple-900/20 rounded-lg">
              <p className="text-xs text-gray-400">Wallet Address</p>
              <p className="text-sm font-mono truncate">{address}</p>
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
              <Link to="/rewards">
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create BlockWard Award
                </Button>
              </Link>
              <Link to="/students">
                <Button variant="outline" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Points
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <Link to="/rewards">
                <Button className="w-full">
                  <Wallet className="w-4 h-4 mr-2" />
                  View My BlockWards
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
