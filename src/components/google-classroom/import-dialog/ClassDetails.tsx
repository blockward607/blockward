
import { GoogleClassroom } from "@/services/google-classroom";
import { Skeleton } from "@/components/ui/skeleton";

interface ClassDetailsProps {
  course: GoogleClassroom;
  loading: boolean;
  students: any[];
  studentsLoaded: boolean;
}

export function ClassDetails({ course, loading, students, studentsLoaded }: ClassDetailsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Class Details</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Name:</span>
          <span className="font-medium">{course.name}</span>
        </div>
        
        {course.description && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Description:</span>
            <span className="font-medium max-w-xs text-right">{course.description}</span>
          </div>
        )}
        
        {course.section && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Section:</span>
            <span className="font-medium">{course.section}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Students:</span>
          {loading || !studentsLoaded ? (
            <Skeleton className="h-4 w-8" />
          ) : (
            <span className="font-medium">{students.length}</span>
          )}
        </div>
      </div>
    </div>
  );
}
