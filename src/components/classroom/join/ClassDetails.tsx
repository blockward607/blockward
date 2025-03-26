
import { Skeleton } from "@/components/ui/skeleton";

interface ClassDetailsProps {
  course: any;
  loading: boolean;
  students: any[];
  studentsLoaded: boolean;
}

export const ClassDetails = ({ course, loading, students, studentsLoaded }: ClassDetailsProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">Class Details</h3>
      <div className="space-y-2">
        <p className="text-sm"><span className="font-medium">Name:</span> {course.name}</p>
        {course.section && (
          <p className="text-sm"><span className="font-medium">Section:</span> {course.section}</p>
        )}
        {course.description && (
          <p className="text-sm"><span className="font-medium">Description:</span> {course.description}</p>
        )}
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Students</h4>
        {studentsLoaded ? (
          <p className="text-sm">{students.length} students will be imported</p>
        ) : (
          <Skeleton className="h-4 w-32" />
        )}
      </div>
    </div>
  );
};
