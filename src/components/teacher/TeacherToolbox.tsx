
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ToolboxGrid } from "./toolbox/ToolboxGrid";
 
export const TeacherToolbox = () => {
  return (
    <Card className="p-6 glass-card">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold gradient-text">Teacher Toolbox</h2>
        </div>

        <ToolboxGrid />
      </div>
    </Card>
  );
};
