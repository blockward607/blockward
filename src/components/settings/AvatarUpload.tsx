
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, UserRound, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AvatarUploadProps {
  avatarUrl: string | null;
  fullName: string;
  onAvatarChange: (url: string) => void;
}

const AvatarUpload = ({ avatarUrl, fullName, onAvatarChange }: AvatarUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        toast({
          variant: "destructive",
          title: "No file selected",
          description: "Please select an image to upload."
        });
        return;
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a valid image file (PNG, JPG, GIF, etc.)."
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "File size must be less than 5MB."
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      console.log('Uploading avatar file:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        filePath: filePath
      });

      // Upload the file to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('Bucket not found')) {
          toast({
            variant: "destructive",
            title: "Storage not ready",
            description: "Avatar storage is not set up yet. Please contact support."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Upload failed",
            description: uploadError.message || "Failed to upload avatar."
          });
        }
        return;
      }

      console.log('Upload successful:', data);

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }

      onAvatarChange(publicUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload avatar. Please try again."
      });
    } finally {
      setUploading(false);
      // Reset the input value so the same file can be selected again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <Avatar className="w-24 h-24 border-2 border-primary">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={fullName} />
        ) : (
          <AvatarFallback className="bg-primary/10 text-primary">
            <UserRound className="w-12 h-12" />
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex items-center">
        <input
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
          id="avatar-upload"
        />
        <label htmlFor="avatar-upload">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            className="cursor-pointer"
            asChild
          >
            <span>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Picture
                </>
              )}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
};

export default AvatarUpload;
