
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ImageIcon, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NFTImageUploadProps {
  imageUrl: string | null;
  onImageSelect: (url: string) => void;
}

export const NFTImageUpload = ({ imageUrl, onImageSelect }: NFTImageUploadProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image under 5MB"
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select a JPG or PNG image"
      });
      return;
    }

    try {
      setLoading(true);
      
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
      
      toast({
        title: "Image uploaded!",
        description: "Your NFT award image has been uploaded successfully"
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload image: " + (error.message || "")
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    onImageSelect("");
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-purple-300">🎨 Award Image</label>
      
      {imageUrl ? (
        <div className="relative">
          <div className="rounded-xl overflow-hidden shadow-lg border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
            <img 
              src={imageUrl} 
              alt="Award Preview" 
              className="w-full h-48 object-cover object-center"
            />
            <div className="p-4 flex items-center justify-between">
              <div className="text-sm text-purple-200">
                ✨ Your award image looks great!
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={removeImage}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive 
                ? 'border-purple-400 bg-purple-500/10' 
                : 'border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-900/10'
            } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                <p className="text-sm text-purple-300">Uploading your image...</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 rounded-full bg-purple-600/20">
                    <Upload className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-purple-200 mb-1">
                      Drop your NFT image here
                    </p>
                    <p className="text-sm text-gray-400">
                      JPG or PNG up to 5MB • Perfect for award certificates and badges
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label htmlFor="file-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                      disabled={loading}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="bg-amber-900/20 p-3 rounded-lg border border-amber-500/30">
            <div className="text-xs text-amber-300">
              💡 <strong>Pro tip:</strong> Use high-quality images with good contrast. 
              Square images (1:1 ratio) work best for NFT awards!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
