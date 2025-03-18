
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown, ChevronUp, Plus, Send, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface WalletPanelProps {
  expanded?: boolean;
}

export const WalletPanel = ({ expanded = false }: WalletPanelProps) => {
  const { toast } = useToast();
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
        
        // For a student wallet, fetch their points as balance
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
          // For a teacher wallet, set a default balance or fetch from their profile
          const { data: teacherData } = await supabase
            .from('teacher_profiles')
            .select('remaining_credits')
            .eq('user_id', session.user.id)
            .single();
            
          if (teacherData) {
            setBalance(teacherData.remaining_credits || 1000);
          } else {
            setBalance(1000); // Default for teachers
          }
        }
      }
    } catch (error) {
      console.error('Error fetching wallet details:', error);
    }
  };

  const handleCreateBlockward = () => {
    if (!isTeacher) {
      toast({
        title: "Permission Denied",
        description: "Only teachers can create BlockWards",
        variant: "destructive"
      });
      return;
    }

    // Navigate to rewards page for creating BlockWards
    window.location.href = "/rewards";
  };

  const handleSendPoints = () => {
    if (!isTeacher) {
      toast({
        title: "Permission Denied",
        description: "Only teachers can send points",
        variant: "destructive" 
      });
      return;
    }

    // Navigate to students page for sending points
    window.location.href = "/students";
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
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <Award className="w-4 h-4 mr-2" />
                  Create BlockWard Award
                </Button>
              </Link>
              <Link to="/students">
                <Button variant="outline" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send Points to Students
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
      )}
    </Card>
  );
};
