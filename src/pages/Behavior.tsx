
import { BehaviorTracker } from "@/components/behavior/BehaviorTracker";
import { Card } from "@/components/ui/card";
import { Award, BarChart3 } from "lucide-react";

const Behavior = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-purple-600/20">
            <BarChart3 className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Behavior Management</h1>
            <p className="text-gray-400">Track and manage student behavior with rewards and interventions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Positive Records</p>
                <p className="text-2xl font-bold text-green-400">24</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-sm text-gray-400">Interventions</p>
                <p className="text-2xl font-bold text-red-400">8</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">NFT Rewards</p>
                <p className="text-2xl font-bold text-purple-400">12</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total Points</p>
                <p className="text-2xl font-bold text-blue-400">156</p>
              </div>
            </div>
          </Card>
        </div>

        <BehaviorTracker />
      </div>
    </div>
  );
};

export default Behavior;
