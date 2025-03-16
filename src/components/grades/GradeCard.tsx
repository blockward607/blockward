
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileCheck } from "lucide-react";
import { format } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  points_possible: number;
}

interface Grade {
  id: string;
  assignment_id: string;
  assignment: Assignment;
  points_earned: number;
  feedback?: string;
  created_at: string;
}

interface GradeCardProps {
  grade: Grade;
}

export const GradeCard = ({ grade }: GradeCardProps) => {
  const percentage = Math.round((grade.points_earned / grade.assignment.points_possible) * 100);
  
  // Determine the badge color based on the percentage
  const getBadgeVariant = () => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "default";
    if (percentage >= 70) return "warning";
    return "destructive";
  };

  // Get letter grade from percentage
  const getLetterGrade = () => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="p-5 glass-card hover:bg-purple-900/10 transition-all">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-purple-800/20">
            <FileCheck className="w-5 h-5 text-purple-400" />
          </div>
          
          <div>
            <h3 className="font-semibold text-lg">{grade.assignment.title}</h3>
            {grade.assignment.description && (
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                {grade.assignment.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Graded: {formatDate(grade.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <Badge 
              variant={getBadgeVariant() as any} 
              className="px-3 py-1 text-sm"
            >
              {getLetterGrade()}
            </Badge>
            <span className="text-xl font-bold text-white">
              {grade.points_earned}/{grade.assignment.points_possible}
            </span>
          </div>
          <span className="text-sm text-gray-400 mt-1">{percentage}%</span>
          
          {grade.feedback && (
            <div className="mt-3 p-3 bg-black/30 border border-purple-500/20 rounded-md text-sm max-w-xs text-right">
              <p className="text-gray-300 italic">{grade.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
