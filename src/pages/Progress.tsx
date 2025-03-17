
import { Card } from "@/components/ui/card";
import { ChartBar, Trophy, Star } from "lucide-react";

const Progress = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Progress</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-600/20">
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Achievements</h3>
              <p className="text-2xl font-bold text-purple-400">12</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-600/20">
              <Star className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Total Points</h3>
              <p className="text-2xl font-bold text-purple-400">850</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-600/20">
              <ChartBar className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Average Grade</h3>
              <p className="text-2xl font-bold text-purple-400">A-</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Progress;
