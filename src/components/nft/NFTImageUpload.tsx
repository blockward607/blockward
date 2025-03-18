
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2, ImageIcon } from "lucide-react";
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
  const [aiImageDialogOpen, setAiImageDialogOpen] = useState(false);

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
      setAiImageDialogOpen(false);
      
      toast({
        title: "Success",
        description: "AI image generated successfully!"
      });
    } catch (error: any) {
      console.error('AI image generation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate image: " + (error.message || "Unknown error")
      });
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-sm text-gray-400">BlockWard Image</label>
      
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="glass-input"
            disabled={loading}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            </div>
          )}
        </div>
        
        <Dialog open={aiImageDialogOpen} onOpenChange={setAiImageDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-shrink-0 bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/30 text-purple-300"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Generate AI Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Generate BlockWard Image with AI</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Textarea
                placeholder="Describe the image you want to generate... (e.g., 'A shining golden trophy with blue digital particles, educational achievement award, high quality digital art')"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="min-h-[120px]"
              />
              <Button 
                onClick={generateImage}
                disabled={generatingImage || !imagePrompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {generatingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Digital Art...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate BlockWard Image
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {imageUrl ? (
        <div className="mt-4 rounded-lg overflow-hidden shadow-lg border border-purple-500/30">
          <img 
            src={imageUrl} 
            alt="BlockWard Preview" 
            className="w-full h-48 object-cover object-center"
          />
          <div className="p-3 bg-purple-900/30 text-center text-xs text-purple-200">
            BlockWard Image Preview
          </div>
        </div>
      ) : (
        <div className="mt-4 h-40 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500">
          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">No image selected</p>
          <p className="text-xs mt-1">Upload an image or generate one with AI</p>
        </div>
      )}
    </div>
  );
};
