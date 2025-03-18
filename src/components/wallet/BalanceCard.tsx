
import { WalletIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BalanceCardProps {
  balance: number;
  walletAddress?: string;
  isLoading?: boolean;
}

export const BalanceCard = ({ 
  balance, 
  walletAddress, 
  isLoading = false 
}: BalanceCardProps) => {
  const { toast } = useToast();

  const handleSendPoints = () => {
    toast({
      title: "Send Points",
      description: "This feature is coming soon!"
    });
  };

  const handleReceivePoints = () => {
    toast({
      title: "Receive Points",
      description: `Your wallet address: ${walletAddress?.substring(0, 10)}...`
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-purple-600/20 rounded-lg"></div>
          <div className="h-20 bg-purple-600/10 rounded-lg"></div>
          <div className="h-10 bg-purple-600/10 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-purple-600/20">
          <WalletIcon className="w-8 h-8 text-purple-400 mb-2" />
          <h3 className="font-semibold">Balance</h3>
          <p className="text-2xl font-bold text-purple-400">{balance} Points</p>
          {walletAddress && (
            <p className="text-sm text-purple-300/70 mt-1">
              Wallet: {walletAddress.substring(0, 10)}...
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Button 
            className="w-full"
            onClick={handleSendPoints}
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Send Points
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleReceivePoints}
          >
            <ArrowDownRight className="w-4 h-4 mr-2" />
            Receive Points
          </Button>
        </div>
      </div>
    </Card>
  );
};
