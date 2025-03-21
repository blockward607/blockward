
import { useInvitationCode } from "./hooks/useInvitationCode";
import { InvitationLinkDisplay } from "./InvitationLinkDisplay";
import { SharingActions } from "./SharingActions";
import { GenerateInviteButton } from "./GenerateInviteButton";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // Fetch or create an invitation code when component mounts
  useEffect(() => {
    const fetchOrCreateCode = async () => {
      if (!classroomId) return;
      
      try {
        // Check if there's an existing invitation code for this classroom
        const { data, error } = await supabase
          .from('class_invitations')
          .select('invitation_token')
          .eq('classroom_id', classroomId)
          .eq('status', 'pending')
          .eq('email', 'general_invitation@blockward.app')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log("[InviteCodeTab] Found existing invitation code:", data[0].invitation_token);
          setInvitationCode(data[0].invitation_token);
        } else {
          // No existing code, auto-generate one
          console.log("[InviteCodeTab] No existing code found, generating one");
          generateInviteCode();
        }
      } catch (err) {
        console.error("[InviteCodeTab] Error fetching invitation code:", err);
        toast({
          title: "Error", 
          description: "Failed to load invitation code",
          variant: "destructive"
        });
      }
    };
    
    fetchOrCreateCode();
  }, [classroomId, generateInviteCode, setInvitationCode, toast]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-300">
        Generate an invitation link that students can use to join your class.
      </div>
      
      {invitationCode ? (
        <div className="space-y-4">
          <InvitationLinkDisplay 
            invitationCode={invitationCode} 
            getJoinUrl={getJoinUrl} 
          />
          
          <SharingActions 
            invitationCode={invitationCode}
            getJoinUrl={getJoinUrl}
            onGenerateNew={generateInviteCode}
            teacherName={teacherName}
            classroomName={classroomName}
          />
        </div>
      ) : (
        <GenerateInviteButton 
          loading={loading} 
          onClick={generateInviteCode} 
        />
      )}
    </div>
  );
};
