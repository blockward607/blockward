
import { BehaviorTracker } from "@/components/behavior/BehaviorTracker";
import { BarChart3 } from "lucide-react";

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

        <BehaviorTracker />
      </div>
    </div>
  );
};

export default Behavior;
