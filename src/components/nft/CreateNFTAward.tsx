import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ImagePlus, Loader2, LayoutTemplate } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NFTImageUpload } from "./NFTImageUpload";
import { StudentSelect } from "./StudentSelect";
import { NFTAwardForm } from "./NFTAwardForm";
import { TemplateSelector } from "./TemplateSelector";

export const CreateNFTAward = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [useTemplate, setUseTemplate] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("");
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to create BlockWards"
        });
        return;
      }
      
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (walletError) {
        console.error('Error getting wallet:', walletError);
        
        if (walletError.message.includes('No rows found')) {
          const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .insert({
              user_id: session.user.id,
              address: 'wallet_' + crypto.randomUUID().substring(0, 8),
              type: 'admin'
            })
            .select('*')
            .single();
            
          if (createError) throw createError;
          console.log('Created new wallet:', newWallet);
          
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
              token_id: `award-${Date.now()}`,
              contract_address: "0x" + Math.random().toString(16).slice(2, 42),
              metadata,
              creator_wallet_id: newWallet.id,
              image_url: imageUrl,
              owner_wallet_id: selectedStudent || null,
              network: "testnet",
            })
            .select()
            .single();

          if (nftError) throw nftError;
        } else {
          throw walletError;
        }
      } else {
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
            token_id: `award-${Date.now()}`,
            contract_address: "0x" + Math.random().toString(16).slice(2, 42),
            metadata,
            creator_wallet_id: walletData.id,
            image_url: imageUrl,
            owner_wallet_id: selectedStudent || null,
            network: "testnet",
          })
          .select()
          .single();

        if (nftError) throw nftError;
        
        if (selectedStudent) {
          const { data: studentWallet, error: studentWalletError } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', selectedStudent)
            .single();
            
          if (studentWalletError) throw studentWalletError;
          
          const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
              nft_id: nft.id,
              from_wallet_id: walletData.id,
              to_wallet_id: studentWallet.id,
              transaction_hash: "0x" + Math.random().toString(16).slice(2, 62),
              status: 'completed',
            });

          if (transactionError) throw transactionError;
          
          const { error: incrementError } = await supabase
            .rpc('increment_student_points', {
              student_id: selectedStudent,
              points_to_add: formData.points
            });

          if (incrementError) throw incrementError;
        }
      }

      toast({
        title: "Success",
        description: "BlockWard Award created successfully",
      });

      setFormData({ title: "", description: "", points: 100, nftType: "academic" });
      setImageUrl(null);
      setSelectedStudent("");
      setSelectedTemplate("");
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
            value={selectedStudent}
            onChange={setSelectedStudent}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={loading || !formData.title || !formData.description || !imageUrl}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ImagePlus className="w-4 h-4 mr-2" />
                Create BlockWard Award
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};
