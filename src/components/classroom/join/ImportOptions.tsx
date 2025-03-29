
import { Button } from "@/components/ui/button";
import { Layers, School } from "lucide-react";

export interface ImportOptionsProps {
  onImport: () => void;
}

export const ImportOptions: React.FC<ImportOptionsProps> = ({ onImport }) => {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-400 mb-2">
        Or import from another platform
      </p>
      <div className="grid grid-cols-1 gap-2">
        <Button
          variant="outline"
          onClick={onImport}
          className="w-full flex items-center justify-start text-left bg-black/20 border-purple-500/30 hover:bg-purple-900/20"
        >
          <School className="mr-2 h-4 w-4" />
          Import from Google Classroom
        </Button>
        <Button
          variant="outline"
          disabled
          className="w-full flex items-center justify-start text-left bg-black/20 border-purple-500/30 opacity-50 cursor-not-allowed"
        >
          <Layers className="mr-2 h-4 w-4" />
          Import from Microsoft Teams (Coming Soon)
        </Button>
      </div>
    </div>
  );
};
