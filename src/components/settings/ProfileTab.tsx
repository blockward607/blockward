
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useProfileData } from "@/hooks/useProfileData";

const ProfileTab = () => {
  const {
    fullName,
    setFullName,
    school,
    setSchool,
    subject,
    setSubject,
    loading,
    handleSaveProfile
  } = useProfileData();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input 
            placeholder="Your full name" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>School</Label>
          <Input 
            placeholder="Your school" 
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input 
            placeholder="Your subject" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <Button 
          className="w-full md:w-auto" 
          onClick={handleSaveProfile}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileTab;
