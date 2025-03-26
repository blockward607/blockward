import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

export interface StudentInfoCardProps {
  studentName: string;
  studentEmail: string | null;
  studentPoints: number;
  loading?: boolean;
}

export function StudentInfoCard({ studentName, studentEmail, studentPoints, loading }: StudentInfoCardProps) {
  return (
    <Card className="glass-card hover:bg-purple-900/10 transition-all">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-purple-400" />
          Student Info
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-gray-700 rounded col-span-2"></div>
              <div className="h-2 bg-gray-700 rounded col-span-1"></div>
            </div>
            <div className="h-2 bg-gray-700 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-2 bg-gray-700 rounded col-span-1"></div>
              <div className="h-2 bg-gray-700 rounded col-span-1"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-lg font-semibold">{studentName}</div>
            {studentEmail && <div className="text-sm text-gray-400">{studentEmail}</div>}
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-purple-400">{studentPoints}</span>
              <span className="text-gray-400">points</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
