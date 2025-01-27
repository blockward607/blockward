import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'authorized';

interface AttendanceStatusProps {
  value: AttendanceStatus;
  onChange: (value: AttendanceStatus) => void;
}

export const AttendanceStatusSelect = ({ value, onChange }: AttendanceStatusProps) => {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as AttendanceStatus)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="present">Present</SelectItem>
        <SelectItem value="absent">Absent</SelectItem>
        <SelectItem value="late">Late</SelectItem>
        <SelectItem value="authorized">Authorized Absence</SelectItem>
      </SelectContent>
    </Select>
  );
};