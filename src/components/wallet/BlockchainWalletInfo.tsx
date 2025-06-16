
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Shield, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface BlockchainWalletInfoProps {
  walletAddress: string | null;
  userRole: 'teacher' | 'student' | null;
  isLoading: boolean;
}

export const BlockchainWalletInfo = ({ walletAddress, userRole, isLoading }: BlockchainWalletInfoProps) => {
  const { toast } = useToast();

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Blockchain Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-purple-400" />
          Blockchain Wallet
          <Badge variant={userRole === 'teacher' ? 'default' : 'secondary'}>
            {userRole === 'teacher' ? 'Teacher' : 'Student'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {walletAddress ? (
          <>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Wallet Address</label>
              <div className="flex items-center gap-2 p-2 bg-black/30 rounded border border-purple-500/30">
                <span className="text-sm font-mono text-purple-200 flex-1">
                  {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 6)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <Shield className="h-4 w-4" />
                <span>Wallet secured with encryption</span>
              </div>
              
              {userRole === 'teacher' && (
                <div className="text-sm text-blue-400">
                  ✓ Can mint and transfer NFTs
                </div>
              )}
              
              {userRole === 'student' && (
                <div className="text-sm text-purple-400">
                  ✓ Can receive and view NFTs
                </div>
              )}
              
              <div className="text-sm text-gray-400">
                🔒 Private key export disabled for security
              </div>
            </div>

            <div className="bg-amber-900/20 p-3 rounded border border-amber-500/30">
              <div className="text-xs text-amber-300">
                <strong>Network:</strong> Polygon Mumbai Testnet<br/>
                <strong>Security:</strong> Virtual wallet managed by BlockWard<br/>
                <strong>Gas Fees:</strong> Handled by admin wallet
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-gray-400 mb-2">No blockchain wallet found</div>
            <div className="text-sm text-purple-400">Wallet will be created automatically</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
