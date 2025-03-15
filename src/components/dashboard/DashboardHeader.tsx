
import { ArrowLeft, Bell, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { WalletPanel } from "@/components/wallet/WalletPanel";
import { useTutorial } from "@/hooks/useTutorial";

interface DashboardHeaderProps {
  userName: string | null;
}

export const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { startTutorial, TutorialComponent } = useTutorial();

  return (
    <>
      {TutorialComponent}
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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={startTutorial}
            className="bg-purple-700/20 border-purple-500/30 hover:bg-purple-700/30 mr-2"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Tutorial
          </Button>
          <WalletPanel />
        </div>
      </div>
    </>
  );
};
