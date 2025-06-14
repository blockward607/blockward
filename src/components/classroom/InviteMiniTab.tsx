
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Link2, Loader2 } from "lucide-react";

interface InviteMiniTabProps {
  classroomId: string;
}

export const InviteMiniTab = ({ classroomId }: InviteMiniTabProps) => {
  const [loading, setLoading] = useState(false);
  const [classroomCode, setClassroomCode] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const { toast } = useToast();
  
  // Check for existing classroom code on component mount
  useEffect(() => {
    const checkExistingCode = async () => {
      if (!classroomId) return;
      
      try {
        console.log("[InviteMiniTab] Checking for existing code for classroom:", classroomId);
        
        const { data, error } = await supabase
          .from('classroom_codes')
          .select('code, expires_at')
          .eq('classroom_id', classroomId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Check if the code is still valid
          const expiresAt = new Date(data[0].expires_at);
          const now = new Date();
          
          if (expiresAt > now) {
            const code = data[0].code;
            console.log("[InviteMiniTab] Found existing valid code:", code);
            setClassroomCode(code);
            // Create join link with the code
            setJoinLink(`${window.location.origin}/classes?code=${code}`);
          } else {
            console.log("[InviteMiniTab] Found expired code");
          }
        }
      } catch (error) {
        console.error("[InviteMiniTab] Error checking for existing code:", error);
      }
    };
    
    checkExistingCode();
  }, [classroomId]);

  const generateClassroomCode = async () => {
    setLoading(true);
    try {
      if (!classroomId) {
        throw new Error("No classroom ID provided");
      }
      
      console.log("[InviteMiniTab] Generating new code for classroom:", classroomId);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }
      
      // Call the database function to create a new code
      const { data: newCode, error } = await supabase.rpc('create_classroom_code', {
        p_classroom_id: classroomId,
        p_created_by: session.user.id
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to generate classroom code');
      }
      
      console.log("[InviteMiniTab] Code generated successfully:", newCode);
      setClassroomCode(newCode);
      
      // Create a link with the classroom code
      const link = `${window.location.origin}/classes?code=${newCode}`;
      setJoinLink(link);
      
      toast({
        title: "Classroom Code Generated",
        description: "Share this code with your students",
      });
    } catch (error: any) {
      console.error("[InviteMiniTab] Error in generateClassroomCode:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate classroom code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joinLink || classroomCode);
    toast({
      title: "Copied!",
      description: joinLink ? "Join link copied to clipboard" : "Classroom code copied to clipboard",
    });
  };

  return (
    <div className="space-y-4">
      {classroomCode ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={joinLink || classroomCode} 
              readOnly 
              className="font-mono bg-black/50 border-purple-500/30 text-sm"
            />
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
            This join link expires in 90 days. Share it with your students.
          </p>
        </div>
      ) : (
        <Button 
          onClick={generateClassroomCode} 
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 mr-2" />
              Generate Classroom Code
            </>
          )}
        </Button>
      )}
    </div>
  );
};
