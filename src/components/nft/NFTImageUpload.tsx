
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

  const createNftImagesBucketIfNeeded = async () => {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      
      // Ensure the bucket exists
      await createNftImagesBucketIfNeeded();
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('nft-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('nft-images')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully, public URL:', publicUrl);
      onImageSelect(publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image: " + (error.message || "")
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
      <label className="text-sm text-gray-400">BlockWard Image</label>
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
              <DialogTitle>Generate BlockWard Image with AI</DialogTitle>
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
            alt="BlockWard Preview" 
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};
