
import { WalletIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
  const [isExpanded, setIsExpanded] = useState(false);

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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <WalletIcon className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold">Balance</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      <p className="text-2xl font-bold text-purple-400">{balance} Points</p>
      
      {isExpanded && (
        <div className="mt-4 space-y-3 pt-3 border-t border-gray-700">
          {walletAddress && (
            <div className="space-y-1">
              <h4 className="text-sm text-gray-400">Wallet Address</h4>
              <p className="text-xs font-mono truncate">{walletAddress}</p>
            </div>
          )}
          <div className="space-y-1">
            <h4 className="text-sm text-gray-400">Account Type</h4>
            <p className="text-sm">BlockWard Wallet</p>
          </div>
        </div>
      )}
    </Card>
  );
};
