
import React from "react";
import { SelectItem } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Sparkles } from "lucide-react";
import { Student, getColorForPoints, getBadgeForPoints, getAvatarBorderColor } from "./StudentSelectHelpers";

interface StudentSelectItemProps {
  student: Student;
}

export const StudentSelectItem: React.FC<StudentSelectItemProps> = ({ student }) => {
  return (
    <SelectItem key={student.id} value={student.id} className="focus:bg-purple-500/20">
      <div className="flex items-center gap-3">
        <Avatar className={`h-7 w-7 border ${getAvatarBorderColor(student.points || 0)}`}>
          <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${student.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`} />
          <AvatarFallback className="bg-purple-800/30 text-purple-100 text-xs">
            {student.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span>{student.name}</span>
            {student.points >= 600 && (
              <Sparkles className="h-3 w-3 text-amber-400" />
            )}
          </div>
          {student.school && (
            <span className="text-xs text-gray-500">{student.school}</span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className={`text-xs ${getColorForPoints(student.points || 0)} flex items-center`}>
            <Star className="w-3 h-3 mr-1" />
            {student.points || 0}
          </div>
          {getBadgeForPoints(student.points || 0)}
        </div>
      </div>
    </SelectItem>
  );
};
