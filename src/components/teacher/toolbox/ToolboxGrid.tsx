
import { Users, Award, Plus, Upload, Download, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ToolboxCard } from "./ToolboxCard";
import { SendPointsDialog } from "./SendPointsDialog";
import { ImportDataDialog } from "./ImportDataDialog";
import { ClassCodeDialog } from "./ClassCodeDialog";

export const ToolboxGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ToolboxCard 
        icon={<Users className="w-5 h-5 text-purple-400" />}
        title="Manage Students"
        description="Add, remove, or manage students in your classes"
        action={
          <Link to="/students" className="mt-auto w-full">
            <Button className="w-full" variant="outline">
              <Users className="w-4 h-4 mr-2" /> 
              View Students
            </Button>
          </Link>
        }
      />

      <ToolboxCard 
        icon={<Award className="w-5 h-5 text-purple-400" />}
        title="Issue NFT Awards"
        description="Create and distribute achievement NFTs to students"
        action={
          <Link to="/rewards" className="mt-auto w-full">
            <Button className="w-full" variant="outline">
              <Award className="w-4 h-4 mr-2" /> 
              Create NFTs
            </Button>
          </Link>
        }
      />

      <ToolboxCard 
        icon={<Plus className="w-5 h-5 text-purple-400" />}
        title="Send Points"
        description="Award behavior points to students"
        action={<SendPointsDialog />}
      />

      <ToolboxCard 
        icon={<Upload className="w-5 h-5 text-purple-400" />}
        title="Import Data"
        description="Import student data from CSV or Excel files"
        action={<ImportDataDialog />}
      />

      <ToolboxCard 
        icon={<Download className="w-5 h-5 text-purple-400" />}
        title="Export Reports"
        description="Export grades, attendance, and behavior data"
        action={
          <Button className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" /> 
            Export
          </Button>
        }
      />

      <ToolboxCard 
        icon={<Key className="w-5 h-5 text-purple-400" />}
        title="Class Codes"
        description="Generate and manage unique class join codes"
        action={<ClassCodeDialog />}
      />
    </div>
  );
};
