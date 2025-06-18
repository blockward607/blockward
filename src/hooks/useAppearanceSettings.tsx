
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
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error or no session:', sessionError);
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
        // Create default preferences if they don't exist
        await createDefaultPreferences(session.user.id);
      } else if (preferences) {
        console.log('Loaded preferences:', preferences);
        setDarkMode(preferences.dark_mode ?? true);
        setCompactView(preferences.compact_view ?? false);
      } else {
        console.log('No preferences found, creating defaults');
        await createDefaultPreferences(session.user.id);
      }
    } catch (error) {
      console.error('Error in loadPreferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async (userId: string) => {
    try {
      console.log('Creating default preferences for user:', userId);
      const { error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          dark_mode: true,
          compact_view: false,
          tutorial_completed: false
        });

      if (error) {
        console.error('Error creating default preferences:', error);
        throw error;
      } else {
        console.log('Default preferences created successfully');
        setDarkMode(true);
        setCompactView(false);
      }
    } catch (error) {
      console.error('Failed to create default preferences:', error);
    }
  };

  const updatePreference = async (field: string, value: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please log in to save preferences"
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
        description: `Failed to save ${field}: ${error.message}`
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
