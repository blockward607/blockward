
import { useState } from "react";
import { Link2, Loader2, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthService } from "@/services/AuthService";

export const InviteCodeTab = () => {
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateInviteCode = async () => {
    setLoading(true);
    try {
      // Get first classroom of the teacher
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to generate codes"
        });
        return;
      }

      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!teacherProfile) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Teacher profile not found"
        });
        return;
      }

      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id')
        .eq('teacher_id', teacherProfile.id)
        .limit(1);

      if (!classrooms || classrooms.length === 0) {
        toast({
          variant: "destructive",
          title: "No Classroom",
          description: "Please create a classroom first"
        });
        return;
      }

      const { data } = await AuthService.createClassInvitation(classrooms[0].id);
      
      if (data) {
        setInvitationCode(data.invitation_token);
        toast({
          title: "Code Generated",
          description: "Invitation code generated successfully"
        });
      }
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate invitation code"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationCode);
    toast({
      title: "Copied!",
      description: "Invitation code copied to clipboard"
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="text-sm text-gray-300 mb-2">
        Generate an invitation code that students can use to join your class.
      </div>
      
      {invitationCode ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input 
              value={invitationCode} 
              readOnly 
              className="font-mono bg-black/60 border-purple-500/30 text-white"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={copyToClipboard}
              className="bg-purple-700/20 border-purple-500/30 hover:bg-purple-700/40"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            This code expires in 7 days. Share it with your students.
          </p>
        </div>
      ) : (
        <Button 
          onClick={generateInviteCode} 
          disabled={loading}
          className="w-full bg-purple-700 hover:bg-purple-800 py-6 text-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Link2 className="w-5 h-5" />
              Generate Invitation Code
            </>
          )}
        </Button>
      )}
    </div>
  );
};
