import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ThumbsUp, ThumbsDown } from "lucide-react";

export const BehaviorTracker = () => {
  return (
    <Card className="p-6 glass-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold gradient-text">Behavior Tracking</h2>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" /> Record Behavior
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 glass-card bg-green-900/20">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold">Positive Behaviors</h3>
          </div>
          <p className="text-sm text-gray-400">No positive behaviors recorded yet</p>
        </Card>

        <Card className="p-4 glass-card bg-red-900/20">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsDown className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold">Negative Behaviors</h3>
          </div>
          <p className="text-sm text-gray-400">No negative behaviors recorded yet</p>
        </Card>
      </div>
    </Card>
  );
};