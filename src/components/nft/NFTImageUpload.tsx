
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface NFTImageUploadProps {
  imageUrl: string | null;
  onImageSelect: (url: string) => void;
}

export const NFTImageUpload = ({ imageUrl, onImageSelect }: NFTImageUploadProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");

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

      onImageSelect(publicUrl);
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
    if (!imagePrompt) {
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
        body: { prompt: imagePrompt }
      });

      if (error) throw error;
      onImageSelect(data.imageUrl);
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

  return (
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
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
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

      {imageUrl && (
        <div className="mt-4">
          <img 
            src={imageUrl} 
            alt="NFT Preview" 
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};
