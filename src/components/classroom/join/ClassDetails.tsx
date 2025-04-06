
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Users } from "lucide-react";
import { GoogleClassroom } from "@/services/google-classroom";

interface ClassDetailsProps {
  course: GoogleClassroom;
  loading: boolean;
  students: any[];
  studentsLoaded: boolean;
}

export function ClassDetails({ 
  course, 
  loading, 
  students, 
  studentsLoaded 
}: ClassDetailsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Class Details</h3>
      
      <Card>
        <CardContent className="pt-6">
          <dl className="space-y-3">
            <div className="flex flex-col">
              <dt className="text-sm text-muted-foreground">Class Name</dt>
              <dd className="font-medium">{course.name}</dd>
            </div>
            
            {course.section && (
              <div className="flex flex-col">
                <dt className="text-sm text-muted-foreground">Section</dt>
                <dd>{course.section}</dd>
              </div>
            )}
            
            <div className="flex flex-col">
              <dt className="text-sm text-muted-foreground">Enrollment Code</dt>
              <dd>{course.enrollmentCode || "Not available"}</dd>
            </div>
            
            <div className="flex flex-col">
              <dt className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                Students
              </dt>
              <dd>
                {loading ? (
                  <div className="space-y-2 mt-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ) : studentsLoaded ? (
                  <span>{students.length} students</span>
                ) : (
                  <span className="text-muted-foreground italic">Click Import to load students</span>
                )}
              </dd>
            </div>
            
            {course.description && (
              <div className="flex flex-col">
                <dt className="text-sm text-muted-foreground">Description</dt>
                <dd className="text-sm">{course.description}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
