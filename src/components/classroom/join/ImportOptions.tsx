
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface ImportOptionsProps {
  courses: any[];
  selectedCourse: any;
  onSelectCourse: (course: any) => void;
  loading: boolean;
}

export const ImportOptions = ({ courses, selectedCourse, onSelectCourse, loading }: ImportOptionsProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Select a class to import
        </label>
        <Select
          value={selectedCourse?.id || ""}
          onValueChange={(value) => {
            const course = courses.find(c => c.id === value);
            if (course) {
              onSelectCourse(course);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
