import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown, ChevronUp } from "lucide-react";

interface WalletPanelProps {
  expanded?: boolean;
}

export const WalletPanel = ({ expanded = false }: WalletPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [walletType, setWalletType] = useState<'user' | 'admin'>('user');

  return (
    <Card className={`glass-card transition-all ${isExpanded ? 'p-6' : 'p-2'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-400" />
          {isExpanded && (
            <div>
              <h3 className="font-semibold">Blockward Wallet</h3>
              <p className="text-sm text-gray-400">{walletType === 'admin' ? 'Admin Wallet' : 'User Wallet'}</p>
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
          <div className="p-4 bg-purple-900/20 rounded-lg">
            <h4 className="font-medium mb-2">Your NFTs</h4>
            <p className="text-sm text-gray-400">No NFTs found in your wallet</p>
          </div>
          
          {walletType === 'admin' && (
            <div className="space-y-2">
              <Button className="w-full">
                Generate NFT
              </Button>
              <Button variant="outline" className="w-full">
                Send NFT
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};