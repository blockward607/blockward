
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Wallet, ExternalLink, Link as LinkIcon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { blockchainService } from '@/blockchain/services/BlockchainService';
import { truncateAddress } from '@/utils/addressUtils';

interface BlockchainWalletPanelProps {
  onConnect?: (address: string) => void;
}

export const BlockchainWalletPanel = ({ onConnect }: BlockchainWalletPanelProps) => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  
  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);
      
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
      setWalletAddress(address);
      
      // Check if the wallet is a teacher
      try {
        const teacherStatus = await blockchainService.isTeacherWallet();
        setIsTeacher(teacherStatus);
      } catch (error) {
        console.error("Error checking teacher status:", error);
      }
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${truncateAddress(address)}`
      });
      
      if (onConnect) onConnect(address);
      
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect to blockchain wallet"
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast, onConnect]);
  
  // Check if wallet was previously connected
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          await connectWallet();
        } catch (error) {
          console.error("Error reconnecting to wallet:", error);
        }
      }
    };
    
    checkWalletConnection();
  }, [connectWallet]);
  
  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        setWalletAddress(null);
        setIsTeacher(false);
        toast({
          variant: "destructive",
          title: "Wallet Disconnected",
          description: "Your blockchain wallet has been disconnected"
        });
      } else {
        // User switched accounts
        setWalletAddress(accounts[0]);
        toast({
          title: "Account Changed",
          description: `Now connected to ${truncateAddress(accounts[0])}`
        });
      }
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [toast]);
  
  const openBlockExplorer = useCallback(() => {
    if (!walletAddress) return;
    
    const explorerUrl = `https://mumbai.polygonscan.com/address/${walletAddress}`;
    window.open(explorerUrl, '_blank');
  }, [walletAddress]);
  
  return (
    <Card className="p-4 border border-purple-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${walletAddress ? 'bg-green-600/20' : 'bg-purple-600/20'}`}>
            <Wallet className={`h-5 w-5 ${walletAddress ? 'text-green-400' : 'text-purple-400'}`} />
          </div>
          <div>
            <h3 className="text-sm font-medium">Polygon Wallet</h3>
            {walletAddress ? (
              <p className="text-xs font-mono text-green-400">{truncateAddress(walletAddress)}</p>
            ) : (
              <p className="text-xs text-gray-400">Not connected</p>
            )}
          </div>
        </div>
        
        <div className="flex space-x-1">
          {walletAddress && (
            <>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8" 
                onClick={openBlockExplorer}
                title="View on Polygon Scan"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              {isTeacher && (
                <div className="flex items-center bg-green-600/20 text-green-400 text-xs px-2 rounded">
                  <Check className="h-3 w-3 mr-1" />
                  Teacher
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {!walletAddress && (
        <Button 
          className="w-full mt-3 bg-purple-600 hover:bg-purple-700" 
          size="sm" 
          onClick={connectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4 mr-2" />
              Connect MetaMask
            </>
          )}
        </Button>
      )}
    </Card>
  );
};
