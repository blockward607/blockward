
import { User } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StudentInfoCardProps {
  studentName: string | null;
  studentEmail: string | null;
  studentPoints: number;
}

export const StudentInfoCard = ({ studentName, studentEmail, studentPoints }: StudentInfoCardProps) => {
  return (
    <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="p-3 rounded-full bg-purple-600/20">
            <User className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{studentName || 'Welcome'}</h3>
            <p className="text-sm text-gray-400">{studentEmail || 'Loading...'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-2xl text-purple-400">{studentPoints}</span>
          <span className="text-gray-400">points</span>
        </div>
      </div>
    </Card>
  );
};
