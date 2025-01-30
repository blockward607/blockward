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

  return (
    <Select value={value} onValueChange={(val) => onChange(val as AttendanceStatus)}>
      <SelectTrigger className="w-[180px]">
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <SelectValue placeholder="Select status" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="present" className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          Present
        </SelectItem>
        <SelectItem value="absent" className="flex items-center gap-2">
          <X className="w-4 h-4 text-red-500" />
          Absent
        </SelectItem>
        <SelectItem value="late" className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-500" />
          Late
        </SelectItem>
      </SelectContent>
    </Select>
  );
};