
import { Button } from "@/components/ui/button";
import { UserPlus, Library } from "lucide-react";

export interface EmptyClassStateProps {
  userRole: string | null;
}

export const EmptyClassState = ({ userRole }: EmptyClassStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center gap-4 rounded-lg border border-dashed border-purple-500/30 bg-purple-950/10 backdrop-blur-md">
      <div className="p-4 rounded-full bg-purple-500/10">
        {userRole === 'teacher' ? (
          <Library className="w-10 h-10 text-purple-400" />
        ) : (
          <UserPlus className="w-10 h-10 text-purple-400" />
        )}
      </div>
      <h3 className="text-2xl font-semibold text-white">
        {userRole === 'teacher' ? 'No Classes Yet' : 'Not Enrolled in Any Classes'}
      </h3>
      <p className="text-gray-300 max-w-md">
        {userRole === 'teacher' 
          ? 'Create your first class to get started. You can add students, manage resources, and track progress all in one place.'
          : 'Use the join code provided by your teacher to enroll in a class. Once enrolled, you\'ll see your classes here.'}
      </p>
    </div>
  );
};
