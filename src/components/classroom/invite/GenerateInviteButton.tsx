
import { Button } from "@/components/ui/button";
import { Loader2, Link2, Key } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GenerateInviteButtonProps {
  loading: boolean;
  onClick: () => void;
  invitationExists?: boolean;
}

export const GenerateInviteButton = ({ loading, onClick, invitationExists }: GenerateInviteButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={onClick} 
            disabled={loading}
            className={`w-full ${invitationExists ? 'bg-teal-700 hover:bg-teal-800' : 'bg-purple-600 hover:bg-purple-700'}`}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {invitationExists ? "Regenerating..." : "Generating..."}
              </>
            ) : (
              <>
                {invitationExists ? (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Create New Code
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Generate Invitation Link
                  </>
                )}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {invitationExists 
            ? "Generate a new code (this will invalidate the previous code)" 
            : "Create a shareable invitation code for students"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
