
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthService } from "@/services/AuthService";

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
        .maybeSingle();

      if (studentError || !studentData) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not find your student profile"
        });
        setLoading(false);
        return;
      }

      // Directly validate with AuthService
      const { data: invitationData } = await AuthService.validateInvitationCode(invitationCode);
      
      if (!invitationData) {
        toast({
          variant: "destructive",
          title: "Invalid Invitation",
          description: "The invitation code is invalid or has expired"
        });
        setLoading(false);
        return;
      }

      // Check if student is already enrolled
      const { data: existingEnrollment } = await supabase
        .from('classroom_students')
        .select('id')
        .match({
          classroom_id: invitationData.classroom_id,
          student_id: studentData.id
        })
        .single();

      if (existingEnrollment) {
        toast({
          variant: "default",
          title: "Already Enrolled",
          description: "You are already enrolled in this class"
        });
        setLoading(false);
        return;
      }

      // Enroll student using the AuthService
      const { data: enrollmentData, error: enrollError } = await AuthService.enrollStudentInClassroom(
        studentData.id, 
        invitationData.classroom_id
      );

      if (enrollError) {
        throw enrollError;
      }

      // Get class details to show in success message
      const { data: classroom } = await supabase
        .from('classrooms')
        .select('name')
        .eq('id', invitationData.classroom_id)
        .single();

      // Update invitation status
      await supabase
        .from('class_invitations')
        .update({ status: 'accepted' })
        .eq('invitation_token', invitationCode);

      toast({
        title: "Success",
        description: `You have successfully joined ${classroom?.name || 'the class'}`
      });

      setInvitationCode("");
    } catch (error: any) {
      console.error('Error joining class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to join class"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-purple-900/20 backdrop-blur-md border border-purple-500/30 mb-6">
      <h3 className="text-lg font-semibold mb-3">Join a Class</h3>
      <p className="text-sm text-gray-300 mb-4">
        Enter the invitation code provided by your teacher to join their class.
      </p>
      <div className="flex gap-3">
        <Input
          value={invitationCode}
          onChange={(e) => setInvitationCode(e.target.value)}
          placeholder="Enter invitation code"
          className="flex-1 bg-black/60 border-purple-500/30"
        />
        <Button
          onClick={handleJoinClass}
          disabled={loading}
          className="bg-purple-700 hover:bg-purple-800"
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
    </Card>
  );
};
