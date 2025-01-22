import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Plus } from "lucide-react";

export const AchievementSystem = () => {
  return (
    <Card className="p-6 glass-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold gradient-text">Achievements</h2>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" /> Create Achievement
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 glass-card hover:bg-purple-900/10 transition-all">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-semibold">Perfect Attendance</h3>
              <p className="text-sm text-gray-400">100 points</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-4">Attend class for 30 consecutive days</p>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">0 students earned</span>
          </div>
        </Card>
      </div>
    </Card>
  );
};