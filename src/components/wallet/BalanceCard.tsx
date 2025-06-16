
import { WalletIcon, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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

  const copyAddressToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard"
      });
    }
  };

  const openExternalWalletViewer = () => {
    if (walletAddress) {
      window.open(`https://example.com/wallet/${walletAddress}`, '_blank');
      toast({
        title: "External Viewer",
        description: "Opening wallet in external viewer"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-purple-500/20">
        <CardHeader className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-5 h-5 rounded-full bg-purple-400/20 animate-pulse"></div>
            <div className="h-6 w-24 bg-purple-400/20 animate-pulse rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-20 bg-purple-600/10 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-purple-500/20 transition-all hover:shadow-md hover:shadow-purple-500/10">
      <CardHeader className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <WalletIcon className="w-5 h-5 text-purple-400" />
          Wallet Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 p-6 rounded-lg text-center">
            <p className="text-sm text-gray-400 mb-1">Current Balance</p>
            <p className="text-3xl font-bold text-purple-400">{balance} Points</p>
          </div>
          
          {walletAddress && (
            <div className="space-y-2">
              <div className="p-3 bg-purple-900/20 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-gray-400">Wallet Address</p>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 hover:bg-purple-500/20 hover:text-purple-400" 
                      onClick={copyAddressToClipboard}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 hover:bg-purple-500/20 hover:text-purple-400" 
                      onClick={openExternalWalletViewer}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm font-mono truncate">{walletAddress}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
