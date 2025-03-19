
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Key, Loader2, Copy, Clipboard, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

interface ClassCode {
  id: string;
  classroom_id: string;
  invitation_token: string;
  classroom_name: string;
  status: string;
}

export const ClassCodeDialog = () => {
  const [loading, setLoading] = useState(false);
  const [classCodes, setClassCodes] = useState<ClassCode[]>([]);
  const { toast } = useToast();

  const fetchClassCodes = async () => {
    setLoading(true);
    try {
      // Get teacher profile ID first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!teacherProfile) return;

      // Get classrooms for this teacher
      const { data: classrooms } = await supabase
        .from('classrooms')
        .select('id, name')
        .eq('teacher_id', teacherProfile.id);

      if (!classrooms || classrooms.length === 0) return;

      // Get active invitation codes for these classrooms
      const classroomIds = classrooms.map(c => c.id);
      const { data: invitations } = await supabase
        .from('class_invitations')
        .select('id, classroom_id, invitation_token, status')
        .in('classroom_id', classroomIds)
        .eq('status', 'pending')
        .eq('email', 'general_invitation@blockward.app');

      // Map classroom names to invitations
      const codesWithClassroomNames = invitations?.map(invitation => {
        const classroom = classrooms.find(c => c.id === invitation.classroom_id);
        return {
          ...invitation,
          classroom_name: classroom?.name || 'Unnamed Class'
        };
      }) || [];

      setClassCodes(codesWithClassroomNames);
    } catch (error) {
      console.error("Error fetching class codes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load class codes"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewCode = async (classroomId: string) => {
    setLoading(true);
    try {
      // Generate a simple, readable alphanumeric code (6 characters)
      const invitationToken = Array.from({length: 6}, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');
      
      // Store the invitation code in Supabase
      const { data: invitation, error } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classroomId,
          email: 'general_invitation@blockward.app',
          invitation_token: invitationToken,
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Refresh the list of class codes
      fetchClassCodes();
      
      toast({
        title: "Success",
        description: "New class code generated successfully"
      });
    } catch (error) {
      console.error("Error generating class code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate class code"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Class code copied to clipboard"
    });
  };

  // Fetch class codes when the dialog opens
  useEffect(() => {
    const fetchOnOpen = () => {
      fetchClassCodes();
    };
    
    return fetchOnOpen;
  }, []);

  return (
    <Dialog onOpenChange={(open) => open && fetchClassCodes()}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Key className="w-4 h-4 mr-2" /> 
          View Class Codes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Your Class Codes</DialogTitle>
          <DialogDescription>
            Share these codes with students to join your classes
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : classCodes.length > 0 ? (
            <>
              {classCodes.map((classCode) => (
                <div key={classCode.id} className="rounded-md bg-black/20 p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-3 rounded-full bg-purple-800/30 p-2">
                        <Key className="h-4 w-4 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{classCode.classroom_name}</p>
                        <p className="text-xs text-gray-400">Active</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-lg font-bold text-purple-300">
                        {classCode.invitation_token}
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => copyToClipboard(classCode.invitation_token)}
                        className="h-8 w-8 rounded-full"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => generateNewCode(classCode.classroom_id)}
                        className="h-8 w-8 rounded-full"
                        disabled={loading}
                      >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Clipboard className="h-12 w-12 mx-auto text-gray-400" />
              <p className="text-gray-400">No class codes found. Generate a code for your class.</p>
            </div>
          )}
          
          {!loading && classCodes.length === 0 && (
            <Button 
              className="w-full mt-4"
              onClick={() => fetchClassCodes()}
            >
              Refresh
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
