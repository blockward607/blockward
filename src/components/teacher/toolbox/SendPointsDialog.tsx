
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudentSelect } from "@/components/nft/StudentSelect";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export const SendPointsDialog = () => {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [points, setPoints] = useState("10");

  const handleSendPoints = async () => {
    if (!selectedStudent || !points) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a student and enter points amount"
      });
      return;
    }

    try {
      // Add points to student
      const { error } = await supabase.rpc(
        'increment_student_points',
        { student_id: selectedStudent, points_to_add: parseInt(points) }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: `Sent ${points} points to the selected student`
      });
      setSelectedStudent("");
      setPoints("10");
    } catch (error) {
      console.error('Error sending points:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send points"
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Send className="w-4 h-4 mr-2" /> 
          Send Points
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Points to Student</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="student">Select Student</Label>
            <StudentSelect
              value={selectedStudent}
              onChange={setSelectedStudent}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="points">Points Amount</Label>
            <Input
              id="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              className="glass-input"
            />
          </div>
        </div>
        <Button onClick={handleSendPoints} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">Send Points</Button>
      </DialogContent>
    </Dialog>
  );
};
