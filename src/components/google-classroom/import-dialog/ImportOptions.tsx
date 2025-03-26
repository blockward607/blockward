
import { Checkbox } from "@/components/ui/checkbox";

interface ImportOptionsProps {
  importOptions: {
    createClass: boolean;
    importStudents: boolean;
  };
  setImportOptions: (options: { createClass: boolean; importStudents: boolean }) => void;
}

export function ImportOptions({ importOptions, setImportOptions }: ImportOptionsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Import Options</h3>
      
      <div className="flex items-start space-x-2">
        <Checkbox 
          id="createClass" 
          checked={importOptions.createClass} 
          onCheckedChange={(checked) => 
            setImportOptions({...importOptions, createClass: !!checked})
          }
        />
        <div className="space-y-1 leading-none">
          <label
            htmlFor="createClass"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Create BlockWard classroom
          </label>
          <p className="text-xs text-gray-500">
            Create a new classroom with the same name and details
          </p>
        </div>
      </div>
      
      <div className="flex items-start space-x-2">
        <Checkbox 
          id="importStudents" 
          checked={importOptions.importStudents} 
          onCheckedChange={(checked) => 
            setImportOptions({...importOptions, importStudents: !!checked})
          }
          disabled={!importOptions.createClass}
        />
        <div className="space-y-1 leading-none">
          <label
            htmlFor="importStudents"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Import students
          </label>
          <p className="text-xs text-gray-500">
            Send invitations to students in this Google Classroom
          </p>
        </div>
      </div>
    </div>
  );
}
