
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { WalletPanel } from "@/components/wallet/WalletPanel";

interface DashboardHeaderProps {
  userName: string | null;
}

export const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/')}
          className="hover:bg-purple-900/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold gradient-text">Blockward Dashboard</h1>
          <p className="text-gray-400">Welcome back, {userName || 'User'}</p>
        </div>
      </div>
      <WalletPanel />
    </div>
  );
};
