
import { Skeleton } from "@/components/ui/skeleton";
import { GoogleClassroom } from "@/services/google-classroom";

interface ClassDetailsProps {
  course: GoogleClassroom;
  loading: boolean;
  students: any[];
  studentsLoaded: boolean;
}

export function ClassDetails({ course, loading, students, studentsLoaded }: ClassDetailsProps) {
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
    <div>
      <h3 className="font-medium mb-2">Class Details</h3>
      <p className="text-sm"><span className="font-medium">Name:</span> {course.name}</p>
      {course.section && (
        <p className="text-sm"><span className="font-medium">Section:</span> {course.section}</p>
      )}
      {course.description && (
        <p className="text-sm"><span className="font-medium">Description:</span> {course.description}</p>
      )}
      <p className="text-sm mt-2">
        <span className="font-medium">Students:</span> {studentsLoaded ? students.length : "Loading..."}
      </p>
    </div>
  );
}
