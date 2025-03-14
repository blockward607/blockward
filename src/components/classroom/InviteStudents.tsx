
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Copy, Users, Link2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface InviteStudentsProps {
  classroomId: string;
}

export const InviteStudents = ({ classroomId }: InviteStudentsProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_invitations')
        .insert([
          { 
            classroom_id: classroomId,
            email: email.toLowerCase(),
          }
        ])
        .select();

      if (error) throw error;

      setInvitationCode(data?.[0]?.invitation_token || "");

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_invitations')
        .insert([
          { 
            classroom_id: classroomId,
            email: 'general_invitation@blockward.app', // A placeholder email for code generation
          }
        ])
        .select();

      if (error) throw error;

      const code = data?.[0]?.invitation_token || "";
      setInvitationCode(code);

      toast({
        title: "Invitation Code Generated",
        description: "Share this code with your students",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationCode);
    toast({
      title: "Copied!",
      description: "Invitation code copied to clipboard",
    });
  };

  return (
    <Card className="p-4 bg-purple-900/30 backdrop-blur-md border border-purple-500/30 shadow-lg">
      <Tabs defaultValue="code" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-purple-950/50">
          <TabsTrigger value="code" className="data-[state=active]:bg-purple-700/40">Invite Code</TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-purple-700/40">Email Invite</TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="space-y-4">
          <div className="text-sm text-gray-300">
            Generate an invitation code that students can use to join your class.
          </div>
          
          {invitationCode ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input value={invitationCode} readOnly className="font-mono bg-black/50 border-purple-500/30" />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                  className="bg-purple-700/30 border-purple-500/30 hover:bg-purple-600/50"
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
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Generate Invitation Code
            </Button>
          )}
        </TabsContent>
        
        <TabsContent value="email" className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-black/50 border-purple-500/30"
            />
            <Button 
              onClick={handleInvite} 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
          <div className="text-xs text-gray-400">
            Send an email invitation to a specific student.
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
