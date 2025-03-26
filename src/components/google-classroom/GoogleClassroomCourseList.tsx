import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, RotateCw } from "lucide-react";
import { GoogleClassroom } from "@/services/google-classroom";

interface GoogleClassroomCourseListProps {
  courses: GoogleClassroom[];
  onImport: (course: GoogleClassroom) => void;
  onRefresh: () => void;
}

export function GoogleClassroomCourseList({ 
  courses, 
  onImport, 
  onRefresh 
}: GoogleClassroomCourseListProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">No courses found in your Google Classroom account</p>
        <Button onClick={onRefresh} variant="outline" className="gap-2">
          <RotateCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] rounded-md border p-4">
      <div className="space-y-4">
        {courses.map((course) => (
          <div 
            key={course.id} 
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div>
              <h3 className="font-medium">{course.name}</h3>
              {course.section && (
                <p className="text-sm text-gray-500">{course.section}</p>
              )}
            </div>
            <Button 
              onClick={() => onImport(course)} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Import
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
