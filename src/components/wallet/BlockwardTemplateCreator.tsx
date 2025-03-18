
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TemplateSelector } from "@/components/nft/TemplateSelector";
import { ImagePlus, Loader2, Shield, AlertTriangle } from "lucide-react";
import { StudentSelect } from "@/components/nft/StudentSelect";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BlockchainWalletPanel } from "@/components/wallet/BlockchainWalletPanel";
import { blockchainService } from '@/blockchain/services/BlockchainService';
import { Switch } from "@/components/ui/switch";

// Template interface
interface Template {
  id: string;
  title: string;
  description: string;
  points: number;
  type: string;
  imageUrl: string;
}

export const BlockwardTemplateCreator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [useMetaMask, setUseMetaMask] = useState(false);
  const [isBlockchainMinting, setIsBlockchainMinting] = useState(false);
  const [studentWalletAddress, setStudentWalletAddress] = useState<string | null>(null);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);

  // Predefined templates - same as in CreateNFTAward
  const templates = [
    {
      id: "math-excellence",
      title: "Mathematics Excellence Award",
      description: "Awarded for outstanding achievement in mathematics",
      points: 200,
      type: "academic",
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070",
    },
    {
      id: "science-achievement",
      title: "Science Achievement Award",
      description: "Recognizing exceptional work in scientific studies",
      points: 200,
      type: "academic",
      imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070",
    },
    {
      id: "leadership",
      title: "Leadership Excellence",
      description: "Recognizing outstanding leadership qualities and initiative",
      points: 250,
      type: "behavior",
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070",
    },
    {
      id: "perfect-attendance",
      title: "Perfect Attendance",
      description: "Awarded for outstanding attendance record",
      points: 150,
      type: "attendance",
      imageUrl: "https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=2068",
    },
    {
      id: "creativity",
      title: "Creative Excellence",
      description: "Recognizing exceptional creativity and innovation",
      points: 180,
      type: "special",
      imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071",
    }
  ];

  // Handle student selection change
  const handleStudentSelect = async (studentId: string) => {
    setSelectedStudent(studentId);
    
    if (studentId) {
      try {
        const { data, error } = await supabase
          .from('wallets')
          .select('address')
          .eq('user_id', studentId)
          .single();

        if (error) {
          console.error('Error fetching student wallet:', error);
          return;
        }

        setStudentWalletAddress(data.address);
      } catch (error) {
        console.error('Error fetching student wallet:', error);
      }
    } else {
      setStudentWalletAddress(null);
    }
  };

  const handleWalletConnect = (address: string) => {
    setConnectedWalletAddress(address);
    toast({
      title: "Wallet Connected",
      description: `Connected to blockchain with address: ${address.substring(0, 8)}...`
    });
  };

  const createBlockward = async () => {
    if (!selectedTemplate || !selectedStudent) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select both a template and a student"
      });
      return;
    }

    if (!studentWalletAddress) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Student wallet address not found"
      });
      return;
    }

    // Find the selected template
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selected template not found"
      });
      return;
    }

    setLoading(true);
    setIsBlockchainMinting(useMetaMask);

    try {
      // Initialize blockchain service if using MetaMask
      if (useMetaMask) {
        const initialized = await blockchainService.initialize('teacher', useMetaMask);
        if (!initialized) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to initialize blockchain connection."
          });
          setLoading(false);
          return;
        }
      }

      // Create metadata from template
      const metadata = {
        name: template.title,
        description: template.description,
        points: template.points,
        type: template.type,
        image: template.imageUrl,
        created_at: new Date().toISOString(),
        attributes: [
          {
            trait_type: "Type",
            value: template.type
          },
          {
            trait_type: "Points",
            value: template.points.toString()
          }
        ]
      };

      let blockchainResult;
      
      if (useMetaMask) {
        // Mint on actual blockchain
        blockchainResult = await blockchainService.mintBlockWard(studentWalletAddress, metadata);
      } else {
        // Simulated mint
        blockchainResult = {
          tokenId: `simulated-${Date.now()}`,
          transactionHash: `hash-${Date.now()}`
        };
      }

      // Save to database
      await saveToDatabase(blockchainResult, template);

      toast({
        title: "Success",
        description: useMetaMask 
          ? "BlockWard successfully minted on the blockchain!" 
          : "BlockWard successfully created and simulated on the blockchain!",
      });

      // Reset form
      setSelectedTemplate("");
      setSelectedStudent("");
      
    } catch (error: any) {
      console.error("Error creating BlockWard:", error);
      toast({
        variant: "destructive",
        title: "BlockWard Creation Failed",
        description: error.message || "Failed to create BlockWard"
      });
    } finally {
      setLoading(false);
      setIsBlockchainMinting(false);
    }
  };

  const saveToDatabase = async (blockchainResult: any, template: Template) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to create BlockWards");
      }
      
      // Get teacher wallet
      const { data: teacherWallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (walletError) {
        throw walletError;
      }
      
      // Get student wallet
      const { data: studentWallet, error: studentWalletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', selectedStudent)
        .single();
        
      if (studentWalletError) {
        throw studentWalletError;
      }
      
      // Create metadata
      const metadata = {
        name: template.title,
        description: template.description,
        points: template.points,
        type: template.type,
        image: template.imageUrl,
        created_at: new Date().toISOString(),
        attributes: [
          {
            trait_type: "Type",
            value: template.type
          },
          {
            trait_type: "Points",
            value: template.points.toString()
          }
        ]
      };
      
      // Insert NFT record
      const { data: nft, error: nftError } = await supabase
        .from('nfts')
        .insert({
          token_id: blockchainResult.tokenId || `award-${Date.now()}`,
          contract_address: BLOCKWARD_NFT_CONTRACT_ADDRESS,
          metadata,
          creator_wallet_id: teacherWallet.id,
          image_url: template.imageUrl,
          owner_wallet_id: studentWallet.id,
          network: "testnet",
        })
        .select()
        .single();

      if (nftError) throw nftError;
      
      // Insert transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          nft_id: nft.id,
          from_wallet_id: teacherWallet.id,
          to_wallet_id: studentWallet.id,
          transaction_hash: blockchainResult.tokenId || "simulated-" + Date.now(),
          status: 'completed',
        });

      if (transactionError) throw transactionError;
      
      // Increment student points
      const { error: incrementError } = await supabase
        .rpc('increment_student_points', {
          student_id: selectedStudent,
          points_to_add: template.points
        });

      if (incrementError) throw incrementError;
      
      return true;
    } catch (error) {
      console.error("Error saving NFT to database:", error);
      throw error;
    }
  };

  return (
    <Card className="p-6 glass-card">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Create BlockWard from Template</h2>
        
        <TemplateSelector
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelect={setSelectedTemplate}
        />
        
        <div>
          <h3 className="text-md font-medium mb-2">Select Student</h3>
          <StudentSelect
            selectedStudentId={selectedStudent}
            onStudentSelect={handleStudentSelect}
          />
          {selectedStudent && studentWalletAddress && (
            <div className="text-xs text-gray-400 mt-1">
              Student wallet: {studentWalletAddress.substring(0, 8)}...
            </div>
          )}
        </div>
        
        <div className="border border-dashed border-purple-500/30 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-purple-300">Blockchain Integration</h3>
          
          <div className="flex items-center space-x-2 mb-4">
            <Switch 
              id="use-metamask" 
              checked={useMetaMask} 
              onCheckedChange={setUseMetaMask} 
            />
            <label 
              htmlFor="use-metamask" 
              className="text-sm cursor-pointer"
            >
              Use MetaMask for actual blockchain transactions
            </label>
          </div>
          
          {useMetaMask ? (
            <>
              <BlockchainWalletPanel 
                onConnect={handleWalletConnect} 
                accountType="teacher"
              />
              
              {!connectedWalletAddress && (
                <div className="bg-amber-900/20 p-3 rounded-lg border border-amber-500/30 flex items-center mt-4">
                  <AlertTriangle className="h-5 w-5 text-amber-400 mr-3" />
                  <div className="text-sm text-amber-300">
                    Connect your MetaMask wallet above to mint BlockWards directly on the blockchain.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30 flex items-center mt-2">
              <Shield className="h-5 w-5 text-indigo-400 mr-3" />
              <div className="text-sm text-indigo-300">
                Simulated blockchain mint will process NFTs without requiring MetaMask or gas fees.
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={createBlockward} 
            disabled={loading || !selectedTemplate || !selectedStudent || (useMetaMask && !connectedWalletAddress)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isBlockchainMinting ? "Minting..." : "Creating..."}
              </>
            ) : (
              <>
                <ImagePlus className="w-4 h-4 mr-2" />
                {useMetaMask ? "Mint Blockchain NFT" : "Create BlockWard"}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

const BLOCKWARD_NFT_CONTRACT_ADDRESS = '0x4f05A50AF9aCd968A31605c59C376B35EF352aC1';
