
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAppearanceSettings = () => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (preferences) {
        setDarkMode(preferences.dark_mode ?? true);
        setCompactView(preferences.compact_view ?? false);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (field: string, value: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          [field]: value,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save preference"
      });
    }
  };

  const handleToggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    updatePreference('dark_mode', checked);
  };

  const handleToggleCompactView = (checked: boolean) => {
    setCompactView(checked);
    updatePreference('compact_view', checked);
  };

  return {
    darkMode,
    compactView,
    loading,
    handleToggleDarkMode,
    handleToggleCompactView
  };
};
