
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useProfileData } from "@/hooks/useProfileData";
import AvatarUpload from "@/components/settings/AvatarUpload";
import { Loader2 } from "lucide-react";

const ProfileTab = () => {
  const {
    fullName,
    setFullName,
    school,
    setSchool,
    subject,
    setSubject,
    avatarUrl,
    handleAvatarChange,
    loading,
    profileLoading,
    handleSaveProfile
  } = useProfileData();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <span className="ml-2 text-gray-400">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AvatarUpload 
        avatarUrl={avatarUrl} 
        fullName={fullName}
        onAvatarChange={handleAvatarChange} 
      />
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input 
            id="fullName"
            placeholder="Your full name" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="school">School</Label>
          <Input 
            id="school"
            placeholder="Your school" 
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input 
            id="subject"
            placeholder="Your subject" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
        <Button 
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700" 
          onClick={handleSaveProfile}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileTab;
