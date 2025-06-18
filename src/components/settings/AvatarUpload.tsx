
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

  const createAvatarsBucketIfNeeded = async () => {
    try {
      const { data, error } = await supabase.storage.getBucket('avatars');
      if (error && error.message.includes('The resource was not found')) {
        console.log('Avatars bucket does not exist, creating it...');
        const { error: createError } = await supabase.storage.createBucket('avatars', {
          public: true
        });
        if (createError) throw createError;
        console.log('Avatars bucket created successfully');
      }
    } catch (error) {
      console.error('Error checking/creating avatars bucket:', error);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file.');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB.');
      }

      // Ensure bucket exists
      await createAvatarsBucketIfNeeded();

      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${crypto.randomUUID()}.${fileExt}`;

      console.log('Uploading file to path:', filePath);

      // Upload the file to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', data);

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

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
        description: error.message || "Failed to upload avatar.",
      });
    } finally {
      setUploading(false);
      // Reset the input value so the same file can be selected again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    const input = document.getElementById('avatar-upload') as HTMLInputElement;
    if (input) {
      input.click();
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
        <Button
          variant="outline"
          onClick={handleUploadClick}
          disabled={uploading}
          className="relative"
        >
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
        </Button>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          className="sr-only"
        />
      </div>
    </div>
  );
};

export default AvatarUpload;
