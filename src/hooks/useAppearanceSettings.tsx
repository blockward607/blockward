
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setLoading(false);
        return;
      }

      if (!session) {
        console.log('No session found');
        setLoading(false);
        return;
      }

      console.log('Loading preferences for user:', session.user.id);

      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load preferences. Using defaults."
        });
      } else {
        console.log('Loaded preferences:', preferences);
        if (preferences) {
          setDarkMode(preferences.dark_mode ?? true);
          setCompactView(preferences.compact_view ?? false);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load preferences"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (field: string, value: boolean) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Authentication required"
        });
        return;
      }

      console.log(`Updating ${field} to ${value} for user:`, session.user.id);

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          [field]: value,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating preference:', error);
        throw error;
      }

      console.log(`Successfully updated ${field} to ${value}`);
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved.",
      });
    } catch (error: any) {
      console.error('Error updating preference:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save ${field}: ${error.message || 'Unknown error'}`
      });
    }
  };

  const handleToggleDarkMode = (checked: boolean) => {
    console.log('Toggling dark mode to:', checked);
    setDarkMode(checked);
    updatePreference('dark_mode', checked);
  };

  const handleToggleCompactView = (checked: boolean) => {
    console.log('Toggling compact view to:', checked);
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
