
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; 
import { useNavigate } from "react-router-dom";
import { Wallet, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { isValidAddress } from "@/utils/addressUtils";
import { blockchainService } from "@/blockchain/services/BlockchainService";

const WalletVerify = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState("Verifying your wallet credentials...");
  const [isBlockchainWallet, setIsBlockchainWallet] = useState(false);

  useEffect(() => {
    const verifyWalletLogin = async () => {
      try {
        // Get wallet address from localStorage
        const walletAddress = localStorage.getItem('blockward_login_wallet');
        
        if (!walletAddress) {
          setStatus('error');
          setMessage("No wallet address found. Please try signing in again.");
          return;
        }
        
        // Check if it's a blockchain wallet or internal BlockWard wallet
        const isBlockchain = isValidAddress(walletAddress);
        setIsBlockchainWallet(isBlockchain);
        
        if (isBlockchain) {
          // For blockchain wallets, verify with web3
          await verifyBlockchainWallet(walletAddress);
        } else {
          // For internal BlockWard wallets, verify with database
          await verifyInternalWallet(walletAddress);
        }
      } catch (error) {
        console.error("Wallet verification error:", error);
        setStatus('error');
        setMessage("An unexpected error occurred. Please try signing in again.");
      }
    };
    
    const verifyBlockchainWallet = async (walletAddress: string) => {
      try {
        // Initialize blockchain service
        const initialized = await blockchainService.initialize();
        if (!initialized) {
          setStatus('error');
          setMessage("Failed to connect to blockchain. Please ensure MetaMask is installed and try again.");
          return;
        }
        
        // Verify that the connected wallet matches the one being verified
        const connectedAddress = await blockchainService.getWalletAddress();
        if (connectedAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          setStatus('error');
          setMessage("Connected wallet address doesn't match the one you're trying to verify. Please try again.");
          return;
        }
        
        // Find the user associated with this wallet
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('user_id')
          .eq('address', walletAddress)
          .single();
          
        if (walletError || !walletData) {
          // If wallet not found, offer to create a new account
          setStatus('error');
          setMessage("This blockchain wallet is not registered. Please sign up to create an account.");
          return;
        }
        
        // Get user's role from user_roles table
        const { data: userData, error: userError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', walletData.user_id)
          .single();
          
        if (userError || !userData) {
          setStatus('error');
          setMessage("User account not found. Please try signing in with email instead.");
          return;
        }
        
        // Create a session for the user (in a real app, this would involve proper auth)
        // For the demo, we'll store the user ID in localStorage
        localStorage.setItem('blockward_user_id', walletData.user_id);
        localStorage.setItem('blockward_user_role', userData.role);
        localStorage.setItem('blockward_blockchain_wallet', walletAddress);
        
        // Set success status and redirect to dashboard after a delay
        setStatus('success');
        setMessage("Blockchain wallet verified! Redirecting to your dashboard...");
        
        // Clean up the login wallet address
        localStorage.removeItem('blockward_login_wallet');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (error) {
        console.error("Blockchain wallet verification error:", error);
        setStatus('error');
        setMessage("Failed to verify blockchain wallet. Please ensure MetaMask is connected and try again.");
      }
    };
    
    const verifyInternalWallet = async (walletAddress: string) => {
      // Find the user associated with this wallet
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('user_id')
        .eq('address', walletAddress)
        .single();
        
      if (walletError || !walletData) {
        setStatus('error');
        setMessage("Invalid wallet address. Please try signing in again.");
        return;
      }
      
      // Get user's role from user_roles table
      const { data: userData, error: userError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', walletData.user_id)
        .single();
        
      if (userError || !userData) {
        setStatus('error');
        setMessage("User account not found. Please try signing in with email instead.");
        return;
      }
      
      // Create a session for the user (in a real app, this would involve proper auth)
      // For the demo, we'll store the user ID in localStorage
      localStorage.setItem('blockward_user_id', walletData.user_id);
      localStorage.setItem('blockward_user_role', userData.role);
      
      // Set success status and redirect to dashboard after a delay
      setStatus('success');
      setMessage("Wallet verified! Redirecting to your dashboard...");
      
      // Clean up the login wallet address
      localStorage.removeItem('blockward_login_wallet');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    };
    
    verifyWalletLogin();
  }, [navigate, toast]);
  
  const handleBackToSignIn = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[#1A1F2C] to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 rounded-lg border border-purple-500/40 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="p-4 bg-purple-600/30 rounded-full">
              {status === 'verifying' && <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />}
              {status === 'success' && <CheckCircle className="w-12 h-12 text-green-400" />}
              {status === 'error' && <XCircle className="w-12 h-12 text-red-400" />}
            </div>
            
            <h2 className="text-2xl font-bold text-center">
              {isBlockchainWallet ? 'Blockchain Wallet Verification' : 'Wallet Verification'}
            </h2>
            
            <p className="text-center text-gray-300">{message}</p>
            
            {status === 'error' && (
              <Button
                onClick={handleBackToSignIn}
                className="bg-purple-600 hover:bg-purple-700 text-white mt-4"
              >
                Back to Sign In
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletVerify;
