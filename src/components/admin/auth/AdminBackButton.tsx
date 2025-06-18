
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const AdminBackButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleGoBack}
      className="mb-4 text-red-400 hover:text-red-300"
    >
      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
    </Button>
  );
};
