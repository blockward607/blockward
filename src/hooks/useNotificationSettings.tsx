
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useNotificationSettings = () => {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);

  useEffect(() => {
    const savedEmailNotifications = localStorage.getItem('emailNotifications');
    if (savedEmailNotifications !== null) {
      setEmailNotifications(savedEmailNotifications === 'true');
    }
    
    const savedAchievementAlerts = localStorage.getItem('achievementAlerts');
    if (savedAchievementAlerts !== null) {
      setAchievementAlerts(savedAchievementAlerts === 'true');
    }
  }, []);

  const handleSaveNotificationSettings = () => {
    localStorage.setItem('emailNotifications', String(emailNotifications));
    localStorage.setItem('achievementAlerts', String(achievementAlerts));
    
    toast({
      title: "Success",
      description: "Notification settings saved"
    });
  };

  return {
    emailNotifications,
    setEmailNotifications,
    achievementAlerts,
    setAchievementAlerts,
    handleSaveNotificationSettings
  };
};
