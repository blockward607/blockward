
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";

export const JoinClassButton = ({ onClassJoined }: { onClassJoined?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a class code"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get student profile
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!studentData) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Student profile not found"
        });
        return;
      }

      // Try to join classroom with code
      const { data: result, error } = await supabase.rpc('join_classroom_with_code', {
        p_code: classCode.toUpperCase(),
        p_student_id: studentData.id
      });

      if (error) throw error;

      const joinResult = result as { success: boolean; classroom_name?: string; error?: string };

      if (joinResult.success) {
        toast({
          title: "Success!",
          description: `Successfully joined ${joinResult.classroom_name || 'the class'}`
        });
        setClassCode("");
        setIsOpen(false);
        onClassJoined?.();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to join class",
          description: joinResult.error || "Unknown error occurred"
        });
      }
    } catch (error: any) {
      console.error('Error joining class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join class. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Join Class
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Join a Class
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Enter the class code provided by your teacher to join their classroom.
          </p>
          <div className="space-y-2">
            <Label htmlFor="classCode" className="text-gray-300">Class Code</Label>
            <Input
              id="classCode"
              placeholder="Enter class code (e.g. ABC123)"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              className="bg-gray-800 border-gray-600 text-white uppercase"
              maxLength={6}
            />
          </div>
          <Button 
            onClick={handleJoinClass}
            disabled={loading || !classCode.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? "Joining..." : "Join Class"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
