
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailShareButtonProps {
  invitationCode: string;
  classroomName: string;
  teacherName: string;
}

export const EmailShareButton = ({ 
  invitationCode, 
  classroomName, 
  teacherName 
}: EmailShareButtonProps) => {
  const { toast } = useToast();

  const shareViaGmail = () => {
    const subject = encodeURIComponent(`Join my ${classroomName} class on Blockward`);
    const body = encodeURIComponent(`Hello,

I'd like to invite you to join my class ${classroomName} on Blockward. 

Use this invitation code to join: ${invitationCode}

You can also use this direct link to join: ${window.location.origin}/classes?code=${invitationCode}

Best regards,
${teacherName}`);

    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Gmail Opened",
      description: "Compose window opened with invitation code"
    });
  };

  return (
    <Button
      onClick={shareViaGmail}
      className="bg-purple-600 hover:bg-purple-700 w-full"
      variant="default"
    >
      <Mail className="w-4 h-4 mr-2" />
      Share via Email
    </Button>
  );
};
