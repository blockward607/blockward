
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NFT {
  id: string;
  image_url: string;
  metadata: {
    name?: string;
    description?: string;
  };
  token_id: string;
  contract_address: string;
}

export const useStudentData = () => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<{
    id: string;
    name: string;
    points: number;
    school?: string;
  } | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [walletInfo, setWalletInfo] = useState<{
    id: string;
    address: string;
  } | null>(null);

  useEffect(() => {
    async function fetchStudentData() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error("No session found");
          return;
        }

        // Get student profile
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (studentError) {
          console.error("Error fetching student data:", studentError);
          return;
        }
        
        setStudentData(studentData);
        
        // Fetch wallet
        const { data: walletData, error: walletError } = await supabase
          .from('wallets')
          .select('id, address')
          .eq('user_id', session.user.id)
          .single();
          
        if (walletError) {
          console.error("Error fetching wallet:", walletError);
          return;
        }
        
        setWalletInfo(walletData);
        
        // Fetch NFTs
        if (walletData) {
          const { data: nftData, error: nftError } = await supabase
            .from('nfts')
            .select('*')
            .eq('owner_wallet_id', walletData.id);
            
          if (nftError) {
            console.error("Error fetching NFTs:", nftError);
            return;
          }
          
          // Convert the JSON metadata to the expected format
          const formattedNfts = nftData.map(nft => ({
            id: nft.id,
            image_url: nft.image_url || '',
            metadata: typeof nft.metadata === 'string' 
              ? JSON.parse(nft.metadata) 
              : (nft.metadata as any) || { name: '', description: '' },
            token_id: nft.token_id,
            contract_address: nft.contract_address
          }));
          
          setNfts(formattedNfts);
        }
      } catch (error) {
        console.error("Error in fetchStudentData:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, []);

  return {
    loading,
    studentData,
    nfts,
    walletInfo
  };
};
