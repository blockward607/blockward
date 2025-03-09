
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Clock } from "lucide-react";

export type AttendanceStatus = 'present' | 'absent' | 'late';

interface AttendanceStatusProps {
  value: AttendanceStatus;
  onChange: (value: AttendanceStatus) => void;
}

export const AttendanceStatusSelect = ({ value, onChange }: AttendanceStatusProps) => {
  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'absent':
        return <X className="w-4 h-4 text-red-500" />;
      case 'late':
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return "text-green-500 border-green-500/30 bg-green-500/10";
      case 'absent':
        return "text-red-500 border-red-500/30 bg-red-500/10";
      case 'late':
        return "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
    }
  };

  return (
    <Select value={value} onValueChange={(val) => onChange(val as AttendanceStatus)}>
      <SelectTrigger className={`w-[180px] hover-scale transition-all ${getStatusColor(value)}`}>
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <SelectValue placeholder="Select status" />
        </div>
      </SelectTrigger>
      <SelectContent className="border-purple-500/30 bg-background/95 backdrop-blur-sm">
        <SelectItem value="present" className="flex items-center gap-2 hover:bg-green-500/10">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Present</span>
          </div>
        </SelectItem>
        <SelectItem value="absent" className="flex items-center gap-2 hover:bg-red-500/10">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-red-500" />
            <span>Absent</span>
          </div>
        </SelectItem>
        <SelectItem value="late" className="flex items-center gap-2 hover:bg-yellow-500/10">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span>Late</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
