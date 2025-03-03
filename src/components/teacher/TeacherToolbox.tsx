
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, Award, Plus, Settings, 
  Upload, Download, Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StudentSelect } from "@/components/nft/StudentSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const TeacherToolbox = () => {
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
    <Card className="p-6 glass-card">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold gradient-text">Teacher Toolbox</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4 hover:bg-purple-900/10 transition-all">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-purple-600/20">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold">Manage Students</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Add, remove, or manage students in your classes</p>
              <Link to="/students" className="mt-auto">
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" /> 
                  View Students
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-4 hover:bg-purple-900/10 transition-all">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-purple-600/20">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold">Issue NFT Awards</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Create and distribute achievement NFTs to students</p>
              <Link to="/rewards" className="mt-auto">
                <Button className="w-full" variant="outline">
                  <Award className="w-4 h-4 mr-2" /> 
                  Create NFTs
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-4 hover:bg-purple-900/10 transition-all">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-purple-600/20">
                  <Plus className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold">Send Points</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Award behavior points to students</p>
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
                      />
                    </div>
                  </div>
                  <Button onClick={handleSendPoints} className="w-full">Send Points</Button>
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          <Card className="p-4 hover:bg-purple-900/10 transition-all">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-purple-600/20">
                  <Upload className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold">Import Data</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Import student data from CSV or Excel files</p>
              <Button className="w-full mt-auto" variant="outline">
                <Upload className="w-4 h-4 mr-2" /> 
                Import
              </Button>
            </div>
          </Card>

          <Card className="p-4 hover:bg-purple-900/10 transition-all">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-purple-600/20">
                  <Download className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold">Export Reports</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Export grades, attendance, and behavior data</p>
              <Button className="w-full mt-auto" variant="outline">
                <Download className="w-4 h-4 mr-2" /> 
                Export
              </Button>
            </div>
          </Card>

          <Card className="p-4 hover:bg-purple-900/10 transition-all">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-purple-600/20">
                  <Settings className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold">Advanced Settings</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">Configure blockchain settings and permissions</p>
              <Link to="/settings" className="mt-auto">
                <Button className="w-full" variant="outline">
                  <Settings className="w-4 h-4 mr-2" /> 
                  Configure
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
};
