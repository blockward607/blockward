
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvitationLinkDisplayProps {
  invitationCode: string;
  getJoinUrl: () => string;
}

export const InvitationLinkDisplay = ({ invitationCode, getJoinUrl }: InvitationLinkDisplayProps) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Join link copied to clipboard",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400">Share this link with your students:</p>
        <div className="flex gap-2">
          <Input 
            value={getJoinUrl()} 
            readOnly 
            className="font-mono bg-black/50 border-purple-500/30 text-sm text-purple-300"
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => copyToClipboard(getJoinUrl())}
            title="Copy join link"
            className="bg-purple-700/30 border-purple-500/30 hover:bg-purple-600/50"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <p className="text-xs text-gray-400">Or share this code for manual entry:</p>
        <div className="flex gap-2">
          <Input 
            value={invitationCode} 
            readOnly 
            className="font-mono bg-black/50 border-purple-500/30 text-sm text-purple-300 text-center tracking-wider"
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => copyToClipboard(invitationCode)}
            title="Copy invitation code"
            className="bg-purple-700/30 border-purple-500/30 hover:bg-purple-600/50"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-gray-400 mt-2">
        This link expires in 7 days. Students need to log in to join your class.
      </p>
    </div>
  );
};
