
import { Users } from "lucide-react";

interface StudentCountIndicatorProps {
  count: number;
}

export const StudentCountIndicator = ({ count }: StudentCountIndicatorProps) => {
  return (
    <div className="flex items-center text-sm text-gray-400 mb-4">
      <Users className="w-4 h-4 mr-2" />
      <span>{count} students</span>
    </div>
  );
};
