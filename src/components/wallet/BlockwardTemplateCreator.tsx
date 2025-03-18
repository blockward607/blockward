
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TemplateSelector } from "@/components/nft/TemplateSelector";
import { ImagePlus, Loader2, Shield, AlertTriangle, Trophy, LayoutTemplate, Pi, Atom, Code, Dumbbell, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BlockchainWalletPanel } from "@/components/wallet/BlockchainWalletPanel";
import { blockchainService } from '@/blockchain/services/BlockchainService';
import { Switch } from "@/components/ui/switch";
import { NFTAwardForm } from "@/components/nft/NFTAwardForm";
import { NFTImageUpload } from "@/components/nft/NFTImageUpload";

// Template interface
interface Template {
  id: string;
  title: string;
  description: string;
  points: number;
  type: string;
  imageUrl: string;
  icon: JSX.Element;
}

export const BlockwardTemplateCreator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [useMetaMask, setUseMetaMask] = useState(false);
  const [isBlockchainMinting, setIsBlockchainMinting] = useState(false);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);
  const [useTemplate, setUseTemplate] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 100,
    nftType: "academic"
  });
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "math-excellence",
      title: "Mathematics Excellence Award",
      description: "Awarded for outstanding achievement in mathematics and problem-solving skills",
      points: 200,
      type: "academic",
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070",
      icon: <Pi className="w-4 h-4 text-white" />
    },
    {
      id: "science-achievement",
      title: "Science Achievement Award",
      description: "Recognizing exceptional work in scientific studies and experimentation",
      points: 200,
      type: "academic",
      imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070",
      icon: <Atom className="w-4 h-4 text-white" />
    },
    {
      id: "computer-science",
      title: "Computer Science Excellence",
      description: "Celebrating achievements in programming, algorithms and computational thinking",
      points: 220,
      type: "academic",
      imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=2070",
      icon: <Code className="w-4 h-4 text-white" />
    },
    {
      id: "physical-education",
      title: "Physical Education Achievement",
      description: "Recognizing excellence in sports, teamwork and physical fitness",
      points: 180,
      type: "physical",
      imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070",
      icon: <Dumbbell className="w-4 h-4 text-white" />
    },
    {
      id: "creative-arts",
      title: "Creative Arts Excellence",
      description: "Recognizing exceptional creativity and artistic expression",
      points: 180,
      type: "special",
      imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071",
      icon: <Palette className="w-4 h-4 text-white" />
    }
  ]);

  useEffect(() => {
    fetchCustomTemplates();
  }, []);

  const fetchCustomTemplates = async () => {
    try {
      const { data: nfts, error } = await supabase
        .from('nfts')
        .select('*')
        .is('owner_wallet_id', null)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (nfts && nfts.length > 0) {
        const customTemplates = nfts.map(nft => {
          const metadata = typeof nft.metadata === 'string' 
            ? JSON.parse(nft.metadata) 
            : nft.metadata;
            
          return {
            id: `custom-${nft.id}`,
            title: metadata.name || "Custom BlockWard",
            description: metadata.description || "Custom educational achievement award",
            points: metadata.points || 100,
            type: metadata.type || "academic",
            imageUrl: nft.image_url || "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9",
            icon: getIconForType(metadata.type || "academic"),
          };
        });
        
        setTemplates(prevTemplates => {
          // Filter out existing custom templates to avoid duplicates
          const standardTemplates = prevTemplates.filter(t => !t.id.startsWith('custom-'));
          return [...standardTemplates, ...customTemplates];
        });
      }
    } catch (error) {
      console.error('Error fetching custom templates:', error);
    }
  };
  
  const getIconForType = (type: string): JSX.Element => {
    switch (type) {
      case 'academic': return <Trophy className="w-4 h-4 text-white" />;
      case 'math': return <Pi className="w-4 h-4 text-white" />;
      case 'science': return <Atom className="w-4 h-4 text-white" />;
      case 'computer': return <Code className="w-4 h-4 text-white" />;
      case 'physical': return <Dumbbell className="w-4 h-4 text-white" />;
      case 'special': 
      case 'creative': 
      default: return <Palette className="w-4 h-4 text-white" />;
    }
  };

  const handleWalletConnect = (address: string) => {
    setConnectedWalletAddress(address);
    toast({
      title: "Wallet Connected",
      description: `Connected to blockchain with address: ${address.substring(0, 8)}...`
    });
  };

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
  }, [selectedTemplate, useTemplate, templates]);

  const createBlockward = async () => {
    if (useTemplate && !selectedTemplate) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a template"
      });
      return;
    }

    if (!useTemplate && (!formData.title || !formData.description || !imageUrl)) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields for custom award"
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

      // Get metadata from either template or custom form
      let metadata;
      
      if (useTemplate) {
        // Find the selected template
        const template = templates.find(t => t.id === selectedTemplate);
        if (!template) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Selected template not found"
          });
          setLoading(false);
          return;
        }
        
        metadata = {
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
      } else {
        metadata = {
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
      }

      // Get the teacher's wallet
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

      // Insert the NFT without assigning to a student yet
      const { data: nft, error: nftError } = await supabase
        .from('nfts')
        .insert({
          token_id: `award-${Date.now()}`,
          contract_address: BLOCKWARD_NFT_CONTRACT_ADDRESS,
          metadata,
          creator_wallet_id: teacherWallet.id,
          image_url: metadata.image,
          owner_wallet_id: null, // No student assigned yet
          network: "testnet",
        })
        .select()
        .single();

      if (nftError) throw nftError;

      toast({
        title: "Success",
        description: "BlockWard created successfully! It's now available in your wallet to transfer to students."
      });

      // If this was a custom BlockWard, add it to the templates
      if (!useTemplate) {
        const newCustomTemplate = {
          id: `custom-${nft.id}`,
          title: formData.title,
          description: formData.description,
          points: formData.points,
          type: formData.nftType,
          imageUrl: imageUrl as string,
          icon: getIconForType(formData.nftType)
        };
        
        setTemplates(prevTemplates => [...prevTemplates, newCustomTemplate]);
      }

      // Refresh the custom templates list
      fetchCustomTemplates();
      
      // Reset form
      setSelectedTemplate("");
      setFormData({
        title: "",
        description: "",
        points: 100,
        nftType: "academic"
      });
      setImageUrl(null);
      
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

  return (
    <Card className="p-6 glass-card">
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Trophy className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-semibold text-purple-400">Create BlockWard Award</h2>
        </div>
        
        <div className="flex overflow-hidden rounded-lg">
          <button
            type="button"
            className={`flex-1 py-3 px-4 text-center font-medium transition-all flex items-center justify-center ${
              useTemplate
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setUseTemplate(true)}
          >
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Use Template
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 text-center font-medium transition-all flex items-center justify-center ${
              !useTemplate
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setUseTemplate(false)}
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            Custom Award
          </button>
        </div>
        
        {useTemplate ? (
          <>
            <h3 className="text-lg font-medium">Select a Template</h3>
            <TemplateSelector
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelect={setSelectedTemplate}
            />
          </>
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
            disabled={loading || (useTemplate && !selectedTemplate) || (!useTemplate && (!formData.title || !formData.description || !imageUrl)) || (useMetaMask && !connectedWalletAddress)}
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
