
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVirtualWallet } from "@/hooks/useVirtualWallet";

export const VirtualWalletPanel = () => {
  const { toast } = useToast();
  const { walletAddress, isLoading, userRole, canMintNFTs } = useVirtualWallet();
  const [nftCount, setNftCount] = useState(0);

  const copyAddressToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address Copied",
        description: "Virtual wallet address copied to clipboard"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 glass-card">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-purple-400" />
        <div>
          <h3 className="font-semibold">Virtual Wallet</h3>
          <p className="text-sm text-gray-400">
            {userRole === 'teacher' ? 'Teacher Wallet' : 'Student Wallet'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {walletAddress && (
          <div className="p-3 bg-purple-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-gray-400">Wallet Address</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={copyAddressToClipboard}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm font-mono truncate">{walletAddress}</p>
            <div className="flex items-center gap-1 mt-2">
              <Shield className="h-3 w-3 text-green-400" />
              <p className="text-xs text-green-400">Securely encrypted and stored</p>
            </div>
          </div>
        )}
        
        <div className="p-4 bg-purple-900/20 rounded-lg">
          <div className="flex justify-between mb-2">
            <h4 className="font-medium">Role</h4>
            <span className="font-bold text-purple-400 capitalize">{userRole}</span>
          </div>
          <div className="flex justify-between">
            <h4 className="font-medium">Permissions</h4>
            <span className="text-sm text-gray-400">
              {canMintNFTs ? "Create & Send NFTs" : "Receive NFTs Only"}
            </span>
          </div>
        </div>

        <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Security Notice</span>
          </div>
          <p className="text-xs text-amber-200">
            Your private key is encrypted and securely stored. 
            {userRole === 'student' && " You cannot export your private key for security reasons."}
          </p>
        </div>
      </div>
    </Card>
  );
};
