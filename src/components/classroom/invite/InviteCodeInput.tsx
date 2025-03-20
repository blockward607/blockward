
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteCodeInputProps {
  invitationCode: string;
}

export const InviteCodeInput = ({ invitationCode }: InviteCodeInputProps) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationCode);
    toast({
      title: "Copied!",
      description: "Invitation code copied to clipboard",
    });
  };

  return (
    <div className="flex gap-2">
      <Input 
        value={invitationCode} 
        readOnly 
        className="font-mono bg-black/50 border-purple-500/30 text-lg"
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
  );
};
