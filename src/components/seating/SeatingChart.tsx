
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid } from "lucide-react";
import { DraggableSeatingChart } from "./DraggableSeatingChart";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface SeatingChartProps {
  classroomId: string;
}

export const SeatingChart = ({ classroomId }: SeatingChartProps) => {
  return (
    <Card className="p-6 glass-card">
      <Tabs defaultValue="draggable">
        <TabsList className="mb-4">
          <TabsTrigger value="draggable">Draggable Seating Plan</TabsTrigger>
          <TabsTrigger value="grid">Grid Seating</TabsTrigger>
        </TabsList>
        
        <TabsContent value="draggable">
          <DraggableSeatingChart classroomId={classroomId} />
        </TabsContent>
        
        <TabsContent value="grid">
          <div className="text-lg font-semibold mb-4 gradient-text">
            <Grid className="w-5 h-5 inline-block mr-2" />
            Grid-Based Seating (Legacy)
          </div>
          <div className="text-sm text-gray-400 mb-4">
            Switch to the Draggable Seating Plan for more advanced features.
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              const draggableTab = document.querySelector('button[value="draggable"]');
              if (draggableTab instanceof HTMLElement) {
                draggableTab.click();
              }
            }}
          >
            Switch to Draggable Layout
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
