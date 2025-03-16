
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

      // First check if invitation code is valid
      const { data: invitationData, error: validationError } = await supabase
        .from('class_invitations')
        .select('classroom_id, classroom:classrooms(name)')
        .eq('invitation_token', invitationCode)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (validationError || !invitationData) {
        toast({
          variant: "destructive",
          title: "Invalid Invitation",
          description: "The invitation code is invalid or has expired"
        });
        setLoading(false);
        return;
      }

      // Get the student's ID or create student record if it doesn't exist
      let studentId;
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (studentError || !studentData) {
        // Create a student record if none exists
        const username = session.user.email?.split('@')[0] || 'Student';
        const { data: newStudent, error: createError } = await supabase
          .from('students')
          .insert({
            user_id: session.user.id,
            name: username,
            school: '',
            points: 0
          })
          .select('id')
          .single();
          
        if (createError || !newStudent) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not create student profile"
          });
          setLoading(false);
          return;
        }
        
        studentId = newStudent.id;
        
        // Create user role as student if it doesn't exist
        await supabase
          .from('user_roles')
          .insert({
            user_id: session.user.id,
            role: 'student'
          })
          .select()
          .single();
      } else {
        studentId = studentData.id;
      }

      // Check if student is already enrolled
      const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
        .from('classroom_students')
        .select('id')
        .match({
          classroom_id: invitationData.classroom_id,
          student_id: studentId
        })
        .maybeSingle();

      if (existingEnrollment) {
        toast({
          variant: "default",
          title: "Already Enrolled",
          description: "You are already enrolled in this class"
        });
        setLoading(false);
        return;
      }

      // Enroll student
      const { error: enrollError } = await supabase
        .from('classroom_students')
        .insert({
          classroom_id: invitationData.classroom_id,
          student_id: studentId
        });

      if (enrollError) {
        throw new Error("Failed to enroll in the classroom");
      }

      // Update invitation status
      await supabase
        .from('class_invitations')
        .update({ status: 'accepted' })
        .eq('invitation_token', invitationCode);

      toast({
        title: "Success",
        description: `You have successfully joined ${invitationData.classroom?.name || 'the class'}`
      });

      setInvitationCode("");
      
      // Refresh the page to show the newly joined class
      setTimeout(() => {
        window.location.reload();
      }, 1500);
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
