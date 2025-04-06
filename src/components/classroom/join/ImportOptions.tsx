
import { Button } from "@/components/ui/button";
import { GoogleClassroom } from "@/services/google-classroom";
import { Check, ChevronDown, ExternalLink, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useJoinClassContext } from "./JoinClassContext";

interface ImportOptionsProps {
  onImport: () => void;
  googleClassrooms?: GoogleClassroom[];
  onSelectCourse?: (course: GoogleClassroom) => void;
  importOptions?: {
    createClass: boolean;
    importStudents: boolean;
  };
  setImportOptions?: (options: any) => void;
}

export const ImportOptions = ({ 
  onImport, 
  googleClassrooms = [],
  onSelectCourse,
  importOptions,
  setImportOptions 
}: ImportOptionsProps) => {
  const [connecting, setConnecting] = useState(false);
  const { authenticateWithGoogle, isAuthenticated } = useJoinClassContext();
  
  // If this is the import dialog version, render checkboxes
  if (importOptions && setImportOptions) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Import Options</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={importOptions.createClass}
              onChange={(e) => setImportOptions({
                ...importOptions,
                createClass: e.target.checked
              })}
              className="rounded border-gray-400"
            />
            <span>Create classroom</span>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={importOptions.importStudents}
              onChange={(e) => setImportOptions({
                ...importOptions,
                importStudents: e.target.checked
              })}
              className="rounded border-gray-400"
            />
            <span>Invite students</span>
          </label>
        </div>
      </div>
    );
  }
  
  // Handle connecting to Google Classroom
  const handleConnectGoogle = async () => {
    try {
      setConnecting(true);
      await authenticateWithGoogle();
    } catch (err) {
      console.error("Error connecting to Google Classroom:", err);
    } finally {
      setConnecting(false);
    }
  };
  
  return (
    <div className="flex flex-col">
      <h3 className="font-medium mb-2 text-sm text-gray-400">Import from Google Classroom</h3>
      <div className="flex flex-wrap gap-2">
        {!isAuthenticated ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            disabled={connecting}
            onClick={handleConnectGoogle}
          >
            {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect Google Classroom
          </Button>
        ) : (
          <>
            {googleClassrooms && googleClassrooms.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    Select Google Class <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {googleClassrooms.map((course) => (
                    <DropdownMenuItem 
                      key={course.id}
                      onClick={() => onSelectCourse && onSelectCourse(course)}
                    >
                      <span className="truncate flex-1">{course.name}</span>
                      {course.section && (
                        <span className="text-xs text-muted-foreground ml-2">{course.section}</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={onImport}
              >
                Import Google Classroom
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-xs text-muted-foreground"
              onClick={() => window.open('https://classroom.google.com', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open Google Classroom
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
