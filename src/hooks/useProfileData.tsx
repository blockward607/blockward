
import { useProfileFetch } from "./useProfileFetch";
import { useProfileSave } from "./useProfileSave";

export const useProfileData = () => {
  const { profile, setProfile, profileLoading, refetchProfile } = useProfileFetch();
  const { loading, handleSaveProfile } = useProfileSave();

  const handleAvatarChange = (url: string) => {
    console.log('Avatar changed to:', url);
    setProfile(prev => ({ ...prev, avatarUrl: url }));
  };

  const handleSave = () => {
    handleSaveProfile(profile);
  };

  return {
    fullName: profile.fullName,
    setFullName: (value: string) => setProfile(prev => ({ ...prev, fullName: value })),
    school: profile.school,
    setSchool: (value: string) => setProfile(prev => ({ ...prev, school: value })),
    subject: profile.subject,
    setSubject: (value: string) => setProfile(prev => ({ ...prev, subject: value })),
    avatarUrl: profile.avatarUrl,
    handleAvatarChange,
    loading,
    profileLoading,
    handleSaveProfile: handleSave
  };
};
