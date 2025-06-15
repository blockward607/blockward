
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid } from "lucide-react";
import { DraggableSeatingChart } from "./DraggableSeatingChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FrontOfClass } from "./FrontOfClass";
import { Shuffle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SeatingChartProps {
  classroomId: string;
}

export const SeatingChart = ({ classroomId }: SeatingChartProps) => {
  const { toast } = useToast();
  const [shuffleFlag, setShuffleFlag] = useState(0);
  const [activeTab, setActiveTab] = useState("draggable");

  const handleRandomize = () => {
    setShuffleFlag((f) => f + 1);
    toast({
      title: "Seating randomized!",
      description: "Student seats have been shuffled.",
    });
  };

  return (
    <Card className="p-6 glass-card">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="draggable">Draggable Seating Plan</TabsTrigger>
          <TabsTrigger value="grid">Grid Seating</TabsTrigger>
        </TabsList>
        
        <TabsContent value="draggable">
          <FrontOfClass />
          <DraggableSeatingChart
            classroomId={classroomId}
            shuffleFlag={shuffleFlag}
          />
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={handleRandomize}>
              <Shuffle className="w-4 h-4 mr-2" />
              Randomize Seats
            </Button>
          </div>
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
            onClick={() => setActiveTab("draggable")}
          >
            Switch to Draggable Layout
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
