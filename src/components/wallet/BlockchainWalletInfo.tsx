
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Shield, Wallet, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
            BlockWard Wallet
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
    <div className="relative">
      <Badge 
        variant="outline" 
        className="absolute -top-2 -right-2 z-10 bg-indigo-900/80 border-indigo-500/50 text-indigo-200"
      >
        Polygon Mumbai
      </Badge>
      
      <Card className="border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5 text-purple-400" />
            Your BlockWard Wallet
            {userRole && (
              <Badge 
                variant={userRole === 'teacher' ? 'default' : 'secondary'}
                className="ml-2 text-xs"
              >
                {userRole === 'teacher' ? '👩‍🏫 Teacher' : '👨‍🎓 Student'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {walletAddress ? (
            <>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Wallet Address</label>
                <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg border border-purple-500/30">
                  <span className="text-sm font-mono text-purple-200 flex-1">
                    {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 6)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-8 w-8 p-0"
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
                    ✓ Can mint and transfer NFT awards
                  </div>
                )}
                
                {userRole === 'student' && (
                  <div className="text-sm text-purple-400">
                    ✓ Can receive and view NFT awards
                  </div>
                )}
                
                <div className="text-sm text-gray-400">
                  🔒 Private key export disabled for security
                </div>
              </div>

              <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30">
                <div className="flex items-start gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-indigo-400 mt-0.5" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Your wallet is managed by BlockWard for security. All blockchain transactions are handled automatically without requiring any crypto knowledge or fees from you.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="text-xs text-indigo-300">
                    <strong>Virtual Wallet System:</strong> No MetaMask needed<br/>
                    <strong>Gas Fees:</strong> Handled automatically<br/>
                    <strong>Security:</strong> Enterprise-grade encryption
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="mb-4">
                <Wallet className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <div className="text-purple-200 font-medium mb-2">
                  Setting up your wallet...
                </div>
                <div className="text-sm text-gray-400">
                  Don't worry, we'll create a secure wallet for you automatically! 
                  This will only take a moment.
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-purple-500/50 text-purple-300"
                disabled
              >
                <Shield className="h-4 w-4 mr-2" />
                Initializing Secure Wallet...
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
