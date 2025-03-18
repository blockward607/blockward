
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";

interface WalletSignInFormProps {
  setLoading: (loading: boolean) => void;
  setErrorMessage: (message: string) => void;
  setShowError: (show: boolean) => void;
}

export const WalletSignInForm = ({
  setLoading,
  setErrorMessage,
  setShowError,
}: WalletSignInFormProps) => {
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState("");

  const handleWalletSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowError(false);
    
    if (!walletAddress.trim()) {
      setErrorMessage("Please enter a wallet address");
      setShowError(true);
      return;
    }
    
    setLoading(true);

    try {
      // First, find the user associated with this wallet address
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('user_id')
        .eq('address', walletAddress.trim())
        .single();
        
      if (walletError || !walletData) {
        setErrorMessage("No account found with this wallet address");
        setShowError(true);
        setLoading(false);
        return;
      }
      
      // Now, get the user's email to sign them in
      const { data: userData, error: userError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('user_id', walletData.user_id)
        .single();
        
      if (userError || !userData) {
        setErrorMessage("Account exists but role information is missing");
        setShowError(true);
        setLoading(false);
        return;
      }
      
      // Set a special session variable that the backend will use to authenticate
      // This is just a proof of concept. In a real implementation, you'd use 
      // cryptographic signatures to verify wallet ownership
      localStorage.setItem('blockward_login_wallet', walletAddress);

      toast({
        title: "Wallet Verified",
        description: "Signing you in with your wallet..."
      });
      
      // In a real implementation, we would redirect to a crypto signing page
      // For now, we'll redirect to a special wallet auth endpoint
      window.location.href = "/auth/wallet-verify";
    } catch (error) {
      console.error("Wallet sign-in error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-purple-600/30 shadow-[0_0_15px_rgba(147,51,234,0.5)]">
          <Wallet className="w-6 h-6 text-purple-300" />
        </div>
      </div>
      <form onSubmit={handleWalletSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="walletAddress">BlockWard Wallet Address</Label>
          <Input 
            id="walletAddress"
            placeholder="Enter your wallet address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Sign In With Wallet
        </Button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Enter the wallet address associated with your BlockWard account
        </p>
      </form>
    </div>
  );
};
