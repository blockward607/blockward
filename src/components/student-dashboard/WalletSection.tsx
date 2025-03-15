
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletPanel } from "@/components/wallet/WalletPanel";

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
          <p className="text-gray-400 mb-4">Sign up to access your blockchain wallet and NFT collection.</p>
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
