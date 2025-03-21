
import { Button } from "@/components/ui/button";
import { Loader2, Link2 } from "lucide-react";

interface GenerateInviteButtonProps {
  loading: boolean;
  onClick: () => void;
}

export const GenerateInviteButton = ({ loading, onClick }: GenerateInviteButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
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
          Generate Invitation Link
        </>
      )}
    </Button>
  );
};
