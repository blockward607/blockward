
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletPanel } from "@/components/wallet/WalletPanel";
import { Wallet } from "lucide-react";

interface WalletSectionProps {
  isDemo: boolean;
  onSignUp: () => void;
}

export const WalletSection = ({ isDemo, onSignUp }: WalletSectionProps) => {
  return (
    <Card className="p-6 glass-card">
      <h3 className="text-lg font-semibold mb-4">My Wallet</h3>
      {isDemo ? (
        <div className="text-center py-4">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-900/20 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-purple-400" />
            </div>
            <p className="mt-3 text-gray-400">
              Sign up to access your blockchain wallet and start earning BlockWard NFTs and points.
            </p>
          </div>
          <Button
            onClick={onSignUp}
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
          >
            Create Account
          </Button>
        </div>
      ) : (
        <WalletPanel expanded={true} />
      )}
    </Card>
  );
};
