
import { useClassroomCode } from "./hooks/useClassroomCode";
import { InvitationLinkDisplay } from "./InvitationLinkDisplay";
import { SharingActions } from "./SharingActions";
import { GenerateInviteButton } from "./GenerateInviteButton";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ServerOff } from "lucide-react";

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
  const { loading, classroomCode, generateClassroomCode, getJoinUrl, setClassroomCode } = useClassroomCode({ 
    classroomId 
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Auto-generate code if none exists
  useEffect(() => {
    const autoGenerateCode = async () => {
      if (!classroomId || classroomCode) return;
      
      try {
        setError(null);
        console.log("[InviteCodeTab] Auto-generating code for classroom:", classroomId);
        await generateClassroomCode();
      } catch (err: any) {
        console.error("[InviteCodeTab] Error auto-generating code:", err);
        setError(err.message || "Failed to generate classroom code");
        toast({
          title: "Error", 
          description: "Failed to generate classroom code",
          variant: "destructive"
        });
      }
    };
    
    // Small delay to ensure component is mounted
    const timer = setTimeout(autoGenerateCode, 100);
    return () => clearTimeout(timer);
  }, [classroomId, classroomCode, generateClassroomCode, toast]);

  const handleGenerateNew = () => {
    setError(null);
    generateClassroomCode();
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-300">
        Generate a classroom code that students can use to join your class.
      </div>
      
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
          <ServerOff className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {classroomCode ? (
        <div className="space-y-4">
          <InvitationLinkDisplay 
            invitationCode={classroomCode} 
            getJoinUrl={getJoinUrl} 
          />
          
          <SharingActions 
            invitationCode={classroomCode}
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
