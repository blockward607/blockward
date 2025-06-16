
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap } from "lucide-react";

interface BalanceCardProps {
  balance: number;
  walletAddress: string | null;
  isLoading: boolean;
}

export const BalanceCard = ({ balance, walletAddress, isLoading }: BalanceCardProps) => {
  if (isLoading) {
    return (
      <Card className="border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Learning Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-green-900/20 to-emerald-900/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className="h-5 w-5 text-green-400" />
          Learning Credits
          <Badge variant="outline" className="ml-auto bg-green-900/30 border-green-500/30 text-green-300">
            <Zap className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {balance.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">
              Total earned credits
            </div>
          </div>
          
          <div className="bg-green-900/20 p-3 rounded-lg border border-green-500/30">
            <div className="text-xs text-green-300 space-y-1">
              <div>💎 Earn credits by receiving NFT awards</div>
              <div>🏆 Credits show your achievements</div>
              <div>📈 Watch your progress grow over time</div>
            </div>
          </div>
          
          {walletAddress && (
            <div className="text-xs text-gray-500 text-center">
              Wallet: {walletAddress.substring(0, 6)}...{walletAddress.substring(-4)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
