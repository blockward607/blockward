
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const JoinClassSection = () => {
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleJoinClass = async () => {
    if (!invitationCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an invitation code"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to join a class"
        });
        setLoading(false);
        return;
      }

      // Get the student's ID
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (studentError || !studentData) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not find your student profile"
        });
        setLoading(false);
        return;
      }

      // Check if invitation exists and is valid
      const { data: invitationData, error: invitationError } = await supabase
        .from('class_invitations')
        .select('*')
        .eq('invitation_token', invitationCode)
        .eq('status', 'pending')
        .lt('expires_at', 'now()')
        .maybeSingle();

      if (invitationError) {
        console.error('Error checking invitation:', invitationError);
        throw new Error("Error verifying invitation code");
      }

      if (!invitationData) {
        toast({
          variant: "destructive",
          title: "Invalid Invitation",
          description: "The invitation code is invalid or has expired"
        });
        setLoading(false);
        return;
      }

      // Enroll student in the class
      const { error: enrollError } = await supabase.rpc('enroll_student', {
        invitation_token: invitationCode,
        student_id: studentData.id
      });

      if (enrollError) {
        console.error('Error enrolling student:', enrollError);
        
        // Check if it's already enrolled
        const { data: existingEnrollment } = await supabase
          .from('classroom_students')
          .select('*')
          .eq('classroom_id', invitationData.classroom_id)
          .eq('student_id', studentData.id)
          .maybeSingle();

        if (existingEnrollment) {
          toast({
            variant: "default",
            title: "Already Enrolled",
            description: "You are already enrolled in this class"
          });
        } else {
          throw new Error("Failed to join the class");
        }
      } else {
        toast({
          title: "Success",
          description: "You have successfully joined the class"
        });
        
        // Reset form
        setInvitationCode("");
      }
    } catch (error: any) {
      console.error('Error joining class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to join the class"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-purple-900/30 backdrop-blur-md border border-purple-500/30 shadow-lg">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Join a Class</h2>
        <p className="text-sm text-gray-300">
          Enter the invitation code provided by your teacher to join their class.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Enter invitation code"
            value={invitationCode}
            onChange={(e) => setInvitationCode(e.target.value)}
            className="flex-1 bg-black/50 border-purple-500/30 text-white"
          />
          <Button 
            onClick={handleJoinClass}
            disabled={loading || !invitationCode.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Join Class
              </>
            )}
          </Button>
        </div>

        <div className="mt-4">
          <h3 className="text-md font-medium mb-2 text-purple-300">How to Join a Class</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
            <li>Ask your teacher for the class invitation code</li>
            <li>Enter the code in the field above</li>
            <li>Click "Join Class" to access class resources and activities</li>
          </ol>
        </div>
      </div>
    </Card>
  );
};
