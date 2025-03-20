
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

export const ClassCodeDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Key className="w-4 h-4 mr-2" /> 
          View Codes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your Class Codes</DialogTitle>
          <DialogDescription>
            Share these codes with students to join your classes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-md bg-black/20 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 rounded-full bg-purple-800/30 p-2">
                  <Key className="h-4 w-4 text-purple-300" />
                </div>
                <div>
                  <p className="text-sm font-medium">Math Class</p>
                  <p className="text-xs text-gray-400">Active</p>
                </div>
              </div>
              <div className="font-mono text-lg font-bold text-purple-300">
                ABX45Z
              </div>
            </div>
          </div>
          
          <div className="rounded-md bg-black/20 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 rounded-full bg-purple-800/30 p-2">
                  <Key className="h-4 w-4 text-purple-300" />
                </div>
                <div>
                  <p className="text-sm font-medium">Science Class</p>
                  <p className="text-xs text-gray-400">Active</p>
                </div>
              </div>
              <div className="font-mono text-lg font-bold text-purple-300">
                PWD78Q
              </div>
            </div>
          </div>
          
          <Button className="w-full mt-4">
            Generate New Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
