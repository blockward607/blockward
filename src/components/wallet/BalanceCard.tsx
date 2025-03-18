
import { WalletIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BalanceCardProps {
  balance: number;
  walletAddress?: string;
  isLoading?: boolean;
}

export const BalanceCard = ({ 
  balance, 
  isLoading = false 
}: BalanceCardProps) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-20 bg-purple-600/10 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="p-4 rounded-lg bg-purple-600/20">
        <WalletIcon className="w-8 h-8 text-purple-400 mb-2" />
        <h3 className="font-semibold">Balance</h3>
        <p className="text-2xl font-bold text-purple-400">{balance} Points</p>
      </div>
    </Card>
  );
};
