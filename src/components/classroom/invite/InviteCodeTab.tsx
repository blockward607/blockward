
import { useInvitationCode } from "./hooks/useInvitationCode";
import { InvitationLinkDisplay } from "./InvitationLinkDisplay";
import { SharingActions } from "./SharingActions";
import { GenerateInviteButton } from "./GenerateInviteButton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ServerOff } from "lucide-react";

interface InviteCodeTabProps {
  classroomId: string;
  teacherName?: string;
  classroomName?: string;
}

export const InviteCodeTab = ({ 
  classroomId, 
  teacherName = "Your Teacher", 
  classroomName = "the class" 
}: InviteCodeTabProps) => {
  const { loading, invitationCode, generateInviteCode, getJoinUrl, setInvitationCode } = useInvitationCode({ 
    classroomId 
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch or create an invitation code when component mounts
  useEffect(() => {
    const fetchOrCreateCode = async () => {
      if (!classroomId) return;
      
      try {
        setError(null);
        // Check if there's an existing invitation code for this classroom
        const { data, error } = await supabase
          .from('class_invitations')
          .select('invitation_token, expires_at')
          .eq('classroom_id', classroomId)
          .eq('status', 'pending')
          .eq('email', 'general_invitation@blockward.app')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Check if invitation is still valid
          const expiresAt = new Date(data[0].expires_at);
          const now = new Date();
          
          if (expiresAt > now) {
            console.log("[InviteCodeTab] Found existing valid invitation code:", data[0].invitation_token);
            setInvitationCode(data[0].invitation_token);
          } else {
            console.log("[InviteCodeTab] Found expired invitation, generating new one");
            generateInviteCode();
          }
        } else {
          // No existing code, auto-generate one
          console.log("[InviteCodeTab] No existing code found, generating one");
          generateInviteCode();
        }
      } catch (err: any) {
        console.error("[InviteCodeTab] Error fetching invitation code:", err);
        setError(err.message || "Failed to load invitation code");
        toast({
          title: "Error", 
          description: "Failed to load invitation code",
          variant: "destructive"
        });
      }
    };
    
    fetchOrCreateCode();
  }, [classroomId, generateInviteCode, setInvitationCode, toast]);

  const handleGenerateNew = () => {
    setError(null);
    generateInviteCode();
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-300">
        Generate an invitation link that students can use to join your class.
      </div>
      
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
          <ServerOff className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {invitationCode ? (
        <div className="space-y-4">
          <InvitationLinkDisplay 
            invitationCode={invitationCode} 
            getJoinUrl={getJoinUrl} 
          />
          
          <SharingActions 
            invitationCode={invitationCode}
            getJoinUrl={getJoinUrl}
            onGenerateNew={handleGenerateNew}
            teacherName={teacherName}
            classroomName={classroomName}
          />
        </div>
      ) : (
        <GenerateInviteButton 
          loading={loading} 
          onClick={handleGenerateNew} 
        />
      )}
    </div>
  );
};
