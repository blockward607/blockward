
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
        
        // Check if we're in demo mode
        if (window.location.pathname.includes('view-student')) {
          console.log("Setting demo student data");
          // Set demo student data
          setStudentData({
            id: 'demo-student',
            name: 'Demo Student',
            points: 125,
            school: 'Demo High School'
          });
          
          // Set demo wallet
          setWalletInfo({
            id: 'demo-wallet',
            address: '0xdemoaddress123456789abcdef'
          });
          
          // Set demo NFTs
          setNfts([
            {
              id: 'demo-nft-1',
              image_url: '/placeholder.svg',
              metadata: { 
                name: 'Science Achievement', 
                description: 'Awarded for excellence in science class' 
              },
              token_id: '1',
              contract_address: '0xdemocontract'
            },
            {
              id: 'demo-nft-2',
              image_url: '/placeholder.svg',
              metadata: { 
                name: 'Perfect Attendance', 
                description: 'Awarded for 30 days of perfect attendance' 
              },
              token_id: '2',
              contract_address: '0xdemocontract'
            }
          ]);
          
          setLoading(false);
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found in useStudentData");
          setLoading(false);
          return;
        }

        // Get student profile
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (studentError) {
          console.error("Error fetching student data:", studentError);
          setLoading(false);
          return;
        }
        
        if (studentData) {
          console.log("Found student data:", studentData);
          setStudentData(studentData);
          
          // Fetch wallet
          const { data: walletData, error: walletError } = await supabase
            .from('wallets')
            .select('id, address')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (walletError) {
            console.error("Error fetching wallet:", walletError);
          } else if (walletData) {
            console.log("Found wallet data:", walletData);
            setWalletInfo(walletData);
            
            // Fetch NFTs
            const { data: nftData, error: nftError } = await supabase
              .from('nfts')
              .select('*')
              .eq('owner_wallet_id', walletData.id);
              
            if (nftError) {
              console.error("Error fetching NFTs:", nftError);
            } else if (nftData) {
              console.log("Found NFT data:", nftData);
              
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
          }
        } else {
          console.log("No student data found");
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
