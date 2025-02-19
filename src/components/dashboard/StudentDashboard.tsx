
import { Card } from "@/components/ui/card";
import { Award, Book, ChartBar, Grid } from "lucide-react";
import { Link } from "react-router-dom";

export const StudentDashboard = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-purple-600/20">
              <Book className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold">My Classes</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">View your enrolled classes and assignments</p>
          <Link to="/classes" className="mt-auto text-purple-400 hover:text-purple-300">
            View classes →
          </Link>
        </div>
      </Card>

      <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-purple-600/20">
              <ChartBar className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold">Behavior Points</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">Track your behavior points and achievements</p>
          <Link to="/behavior" className="mt-auto text-purple-400 hover:text-purple-300">
            View points →
          </Link>
        </div>
      </Card>

      <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-purple-600/20">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold">Achievements</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">View your earned achievements and badges</p>
          <Link to="/achievements" className="mt-auto text-purple-400 hover:text-purple-300">
            View achievements →
          </Link>
        </div>
      </Card>

      <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-purple-600/20">
              <Grid className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold">Seating Plans</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">View your class seating arrangements</p>
          <Link to="/seating" className="mt-auto text-purple-400 hover:text-purple-300">
            View seating →
          </Link>
        </div>
      </Card>
    </div>
  );
};
