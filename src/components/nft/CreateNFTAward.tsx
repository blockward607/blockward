import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ImagePlus, Loader2, LayoutTemplate, Shield, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NFTImageUpload } from "./NFTImageUpload";
import { StudentSelect } from "./StudentSelect";
import { NFTAwardForm } from "./NFTAwardForm";
import { TemplateSelector } from "./TemplateSelector";
import { blockchainService } from '@/blockchain/services/BlockchainService';
import { BlockchainWalletPanel } from "@/components/wallet/BlockchainWalletPanel";
import { Switch } from "@/components/ui/switch";

export const CreateNFTAward = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isBlockchainMinting, setIsBlockchainMinting] = useState(false);
  const [studentWalletAddress, setStudentWalletAddress] = useState<string | null>(null);
  const [useMetaMask, setUseMetaMask] = useState(false);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 100,
    nftType: "academic"
  });

  useEffect(() => {
    checkAndCreateNFTsBucket();
  }, []);

  useEffect(() => {
    if (selectedTemplate && useTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setFormData({
          title: template.title,
          description: template.description,
          points: template.points,
          nftType: template.type
        });
        setImageUrl(template.imageUrl);
      }
    }
  }, [selectedTemplate, useTemplate]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentWalletAddress();
    } else {
      setStudentWalletAddress(null);
    }
  }, [selectedStudent]);

  const fetchStudentWalletAddress = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('address')
        .eq('user_id', selectedStudent)
        .single();

      if (error) {
        console.error('Error fetching student wallet:', error);
        return;
      }

      setStudentWalletAddress(data.address);
    } catch (error) {
      console.error('Error in fetchStudentWalletAddress:', error);
    }
  };

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

  const checkAndCreateNFTsBucket = async () => {
    try {
      const { data, error } = await supabase.storage.getBucket('nft-images');
      
      if (error && error.message.includes('The resource was not found')) {
        console.log('BlockWard images bucket does not exist, creating it...');
        const { error: createError } = await supabase.storage.createBucket('nft-images', {
          public: true
        });
        if (createError) throw createError;
        console.log('BlockWard images bucket created successfully');
      }
    } catch (error) {
      console.error('Error checking/creating BlockWard images bucket:', error);
    }
  };

  const handleWalletConnect = (address: string) => {
    setConnectedWalletAddress(address);
    toast({
      title: "Wallet Connected",
      description: `Connected to blockchain with address: ${address.substring(0, 8)}...`
    });
  };

  const handleBlockchainMint = async () => {
    if (!studentWalletAddress) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Student wallet address not found"
      });
      return;
    }

    setIsBlockchainMinting(true);
    
    try {
      const initialized = await blockchainService.initialize('teacher', useMetaMask);
      if (!initialized) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize blockchain connection."
        });
        return;
      }

      const metadata = {
        name: formData.title,
        description: formData.description,
        points: formData.points,
        type: formData.nftType,
        image: imageUrl,
        created_at: new Date().toISOString(),
        attributes: [
          {
            trait_type: "Type",
            value: formData.nftType
          },
          {
            trait_type: "Points",
            value: formData.points.toString()
          }
        ]
      };

      const result = await blockchainService.mintBlockWard(studentWalletAddress, metadata);
      
      console.log("BlockWard minted on blockchain:", result);
      
      await handleSaveToDatabase(result);
      
      toast({
        title: "Success",
        description: useMetaMask 
          ? "BlockWard successfully minted on the blockchain!" 
          : "BlockWard successfully created and simulated on the blockchain!",
      });
      
      setFormData({ title: "", description: "", points: 100, nftType: "academic" });
      setImageUrl(null);
      setSelectedStudent("");
      setSelectedTemplate("");
      
    } catch (error: any) {
      console.error("Error minting BlockWard on blockchain:", error);
      toast({
        variant: "destructive",
        title: "Blockchain Processing Failed",
        description: error.message || "Failed to process BlockWard"
      });
    } finally {
      setIsBlockchainMinting(false);
    }
  };

  const handleSaveToDatabase = async (blockchainResult: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to create BlockWards");
      }
      
      const { data: teacherWallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (walletError) {
        throw walletError;
      }
      
      const { data: studentWallet, error: studentWalletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', selectedStudent)
        .single();
        
      if (studentWalletError) {
        throw studentWalletError;
      }
      
      const metadata = {
        name: formData.title,
        description: formData.description,
        points: formData.points,
        type: formData.nftType,
        image: imageUrl,
        created_at: new Date().toISOString(),
        attributes: [
          {
            trait_type: "Type",
            value: formData.nftType
          },
          {
            trait_type: "Points",
            value: formData.points.toString()
          }
        ]
      };
      
      const { data: nft, error: nftError } = await supabase
        .from('nfts')
        .insert({
          token_id: blockchainResult.tokenId || `award-${Date.now()}`,
          contract_address: BLOCKWARD_NFT_CONTRACT_ADDRESS,
          metadata,
          creator_wallet_id: teacherWallet.id,
          image_url: imageUrl,
          owner_wallet_id: studentWallet.id,
          network: "testnet",
        })
        .select()
        .single();

      if (nftError) throw nftError;
      
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
      
      const { error: incrementError } = await supabase
        .rpc('increment_student_points', {
          student_id: selectedStudent,
          points_to_add: formData.points
        });

      if (incrementError) throw incrementError;
      
      return true;
    } catch (error) {
      console.error("Error saving NFT to database:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload or generate an image"
      });
      return;
    }

    setLoading(true);

    try {
      await handleBlockchainMint();
    } catch (error: any) {
      console.error('Error creating BlockWard:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create BlockWard Award",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 glass-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-purple-600/20">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-semibold gradient-text">Create BlockWard Award</h2>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex rounded-lg overflow-hidden">
            <button
              type="button"
              className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                useTemplate
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setUseTemplate(true)}
            >
              <LayoutTemplate className="w-4 h-4 mr-2 inline-block" />
              Use Template
            </button>
            <button
              type="button"
              className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
                !useTemplate
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setUseTemplate(false)}
            >
              <ImagePlus className="w-4 h-4 mr-2 inline-block" />
              Custom Award
            </button>
          </div>
        </div>

        {useTemplate ? (
          <TemplateSelector
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
          />
        ) : (
          <>
            <NFTAwardForm 
              formData={formData}
              onChange={setFormData}
            />

            <NFTImageUpload
              imageUrl={imageUrl}
              onImageSelect={setImageUrl}
            />
          </>
        )}

        <div>
          <StudentSelect
            selectedStudentId={selectedStudent}
            onStudentSelect={setSelectedStudent}
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
                    Make sure your wallet has MATIC tokens for gas fees.
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/30 flex items-center mt-2">
              <Shield className="h-5 w-5 text-indigo-400 mr-3" />
              <div className="text-sm text-indigo-300">
                Simulated blockchain mint will process NFTs within our system without requiring MetaMask or gas fees.
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading || !formData.title || !formData.description || !imageUrl || !selectedStudent || (useMetaMask && !connectedWalletAddress)}
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
                {useMetaMask ? "Mint Blockchain NFT" : "Create BlockWard Award"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

const BLOCKWARD_NFT_CONTRACT_ADDRESS = '0x4f05A50AF9aCd968A31605c59C376B35EF352aC1';
