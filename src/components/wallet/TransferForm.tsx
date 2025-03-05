
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
  const [transferAmount, setTransferAmount] = useState("10");
  
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
  
  const handleTransfer = async () => {
    if (!recipientAddress) return;
    
    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount to transfer."
      });
      return;
    }
    
    try {
      // Get the recipient's wallet
      const { data: recipientWallet, error: walletError } = await supabase
        .from('wallets')
        .select('id, user_id')
        .eq('address', recipientAddress)
        .single();
        
      if (walletError) {
        console.error('Error finding recipient wallet:', walletError);
        toast({
          variant: "destructive",
          title: "Recipient not found",
          description: "Could not find a wallet with that address."
        });
        return;
      }
      
      // Get the recipient student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, points')
        .eq('user_id', recipientWallet.user_id)
        .single();
        
      if (studentError) {
        console.error('Error finding student:', studentError);
        toast({
          variant: "destructive",
          title: "Recipient not found",
          description: "Recipient is not a student."
        });
        return;
      }
      
      // Update student points
      const { error: updateError } = await supabase
        .from('students')
        .update({ points: (student.points || 0) + amount })
        .eq('id', student.id);
        
      if (updateError) {
        console.error('Error updating student points:', updateError);
        throw updateError;
      }
      
      toast({
        title: "Transfer Successful",
        description: `Transferred ${amount} points to ${recipientAddress}`
      });
      
      setRecipientAddress("");
      setTransferAmount("10");
      
    } catch (error) {
      console.error('Error during transfer:', error);
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: "Could not complete the transfer. Please try again."
      });
    }
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
      <h3 className="font-semibold text-sm">Teacher Transfer</h3>
      <div className="space-y-2">
        <Label htmlFor="recipient">Recipient Address</Label>
        <Input 
          id="recipient"
          placeholder="Enter wallet address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          disabled={disabled}
        />
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input 
            id="amount"
            type="number"
            placeholder="Amount to transfer"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            disabled={disabled}
            min="1"
          />
        </div>
        <Button 
          className="w-full"
          disabled={!recipientAddress || disabled || parseInt(transferAmount) <= 0}
          onClick={handleTransfer}
        >
          Send Points
        </Button>
      </div>
    </div>
  );
};
