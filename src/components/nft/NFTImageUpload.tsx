
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NFTImageUploadProps {
  imageUrl: string | null;
  onImageSelect: (url: string) => void;
}

export const NFTImageUpload = ({ imageUrl, onImageSelect }: NFTImageUploadProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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
          <p className="text-xs mt-1">Upload an image for your BlockWard</p>
        </div>
      )}
    </div>
  );
};
