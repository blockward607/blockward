import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, ImagePlus, Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const CreateNFTAward = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 100,
    imagePrompt: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching students:', error);
      return;
    }

    setStudents(data || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('nft-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('nft-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!formData.imagePrompt) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an image prompt"
      });
      return;
    }

    setGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-nft-image', {
        body: { prompt: formData.imagePrompt }
      });

      if (error) throw error;
      setImageUrl(data.imageUrl);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate image"
      });
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', (await supabase.auth.getSession()).data.session?.user.id)
        .single();

      if (walletError) throw walletError;

      const metadata = {
        name: formData.title,
        description: formData.description,
        points: formData.points,
        image: imageUrl,
        created_at: new Date().toISOString(),
      };

      const { data: nft, error: nftError } = await supabase
        .from('nfts')
        .insert({
          token_id: `award-${Date.now()}`,
          contract_address: "0x" + Math.random().toString(16).slice(2, 42),
          metadata,
          creator_wallet_id: walletData.id,
          network: "testnet",
          image_url: imageUrl,
        })
        .select()
        .single();

      if (nftError) throw nftError;

      toast({
        title: "Success",
        description: "NFT Award created successfully",
      });

      setFormData({ title: "", description: "", points: 100, imagePrompt: "" });
      setImageUrl(null);
    } catch (error: any) {
      console.error('Error creating NFT:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create NFT Award",
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
          <h2 className="text-2xl font-semibold gradient-text">Create NFT Award</h2>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Award Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="glass-input"
          />

          <Textarea
            placeholder="Award Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="glass-input min-h-[100px]"
          />

          <Input
            type="number"
            placeholder="Points Value"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
            className="glass-input"
          />

          <div className="space-y-2">
            <label className="text-sm text-gray-400">NFT Image</label>
            <div className="flex gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="glass-input"
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate AI Image
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate NFT Image with AI</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Describe the image you want to generate..."
                      value={formData.imagePrompt}
                      onChange={(e) => setFormData({ ...formData, imagePrompt: e.target.value })}
                    />
                    <Button 
                      onClick={generateImage}
                      disabled={generatingImage}
                    >
                      {generatingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {imageUrl && (
            <div className="mt-4">
              <img 
                src={imageUrl} 
                alt="NFT Preview" 
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          <div>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading}
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
                  Create NFT Award
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};