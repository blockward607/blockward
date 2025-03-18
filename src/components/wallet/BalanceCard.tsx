
import { WalletIcon, ArrowUpRight, ArrowDownRight, Copy, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { isValidAddress, truncateAddress } from "@/utils/addressUtils";
import { blockchainService } from "@/blockchain/services/BlockchainService";

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
  const [isBlockchainWallet, setIsBlockchainWallet] = useState(false);
  const [connectedToBlockchain, setConnectedToBlockchain] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      setIsBlockchainWallet(isValidAddress(walletAddress));
    }
  }, [walletAddress]);

  const handleSendPoints = () => {
    if (isBlockchainWallet && !connectedToBlockchain) {
      connectBlockchainWallet();
      return;
    }

    toast({
      title: "Send Points",
      description: "This feature is coming soon!"
    });
  };

  const handleReceivePoints = () => {
    toast({
      title: "Receive Points",
      description: `Your wallet address: ${isBlockchainWallet ? truncateAddress(walletAddress || '') : walletAddress}`
    });
  };

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
      const url = isBlockchainWallet 
        ? `https://mumbai.polygonscan.com/address/${walletAddress}`
        : `https://example.com/wallet/${walletAddress}`;
        
      window.open(url, '_blank');
      toast({
        title: "External Viewer",
        description: "Opening wallet in external viewer"
      });
    }
  };

  const connectBlockchainWallet = async () => {
    try {
      const initialized = await blockchainService.initialize();
      if (!initialized) {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Failed to connect to blockchain wallet. Please ensure MetaMask is installed."
        });
        return;
      }
      
      const address = await blockchainService.getWalletAddress();
      if (address.toLowerCase() !== walletAddress?.toLowerCase()) {
        toast({
          variant: "destructive",
          title: "Wallet Mismatch",
          description: "Connected wallet doesn't match your registered wallet address"
        });
        return;
      }
      
      setConnectedToBlockchain(true);
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your blockchain wallet"
      });
    } catch (error: any) {
      console.error("Error connecting to blockchain:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect to blockchain wallet"
      });
    }
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
        </div>
        
        {walletAddress && (
          <div className="p-3 bg-purple-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-gray-300">
                {isBlockchainWallet ? 'Polygon Wallet' : 'Wallet Address'}
              </p>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={copyAddressToClipboard}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={openExternalWalletViewer}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <p className="text-sm font-mono text-purple-300 truncate">
              {isBlockchainWallet ? truncateAddress(walletAddress) : walletAddress}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isBlockchainWallet 
                ? 'Polygon Mumbai Testnet' 
                : 'Use this address to sign in to your account'}
            </p>
            
            {isBlockchainWallet && !connectedToBlockchain && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2 text-xs"
                onClick={connectBlockchainWallet}
              >
                Connect to MetaMask
              </Button>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <Button 
            className="w-full"
            onClick={handleSendPoints}
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            {isBlockchainWallet && !connectedToBlockchain ? 'Connect Wallet' : 'Send Points'}
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
