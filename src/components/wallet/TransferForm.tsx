
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TransferFormProps {
  disabled?: boolean;
}

export const TransferForm = ({ disabled = false }: TransferFormProps) => {
  const { toast } = useToast();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  
  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      
      setIsTeacher(!!teacherProfile);
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };
  
  const handleTransfer = (amount: number) => {
    if (!recipientAddress) return;
    
    toast({
      title: "Transfer Initiated",
      description: `Demo: This would transfer ${amount} points`
    });
    setRecipientAddress("");
  };

  if (!isTeacher) {
    return (
      <div className="space-y-2 pt-4 border-t border-gray-700">
        <h3 className="font-semibold text-sm">Student Wallet</h3>
        <p className="text-sm text-gray-400">
          Students cannot initiate transfers. Only teachers can send points or NFTs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-4 border-t border-gray-700">
      <h3 className="font-semibold text-sm">Quick Transfer</h3>
      <div className="space-y-2">
        <Label htmlFor="recipient">Recipient Address</Label>
        <Input 
          id="recipient"
          placeholder="Enter wallet address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          disabled={disabled}
        />
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="secondary"
            className="flex-1"
            disabled={!recipientAddress || disabled}
            onClick={() => handleTransfer(10)}
          >
            Send 10
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            className="flex-1"
            disabled={!recipientAddress || disabled}
            onClick={() => handleTransfer(50)}
          >
            Send 50
          </Button>
        </div>
      </div>
    </div>
  );
};
