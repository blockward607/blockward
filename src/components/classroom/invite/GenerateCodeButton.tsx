
import { Button } from "@/components/ui/button";
import { Link2, Loader2 } from "lucide-react";

interface GenerateCodeButtonProps {
  loading: boolean;
  onClick: () => void;
  variant?: "full" | "action";
}

export const GenerateCodeButton = ({ 
  loading, 
  onClick,
  variant = "action"
}: GenerateCodeButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={loading}
      className={variant === "full" 
        ? "w-full bg-purple-600 hover:bg-purple-700 h-12 text-base" 
        : "bg-purple-600 hover:bg-purple-700 w-full"
      }
      variant="default"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Link2 className="w-5 h-5 mr-2" />
          {variant === "full" ? "Generate Invitation Code" : "New Code"}
        </>
      )}
    </Button>
  );
};
