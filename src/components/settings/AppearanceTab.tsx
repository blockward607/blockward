
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { Button } from "@/components/ui/button";
import { useTutorial } from "@/hooks/useTutorial";
import { RefreshCcw, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const AppearanceTab = () => {
  const { 
    darkMode, 
    compactView, 
    loading,
    handleToggleDarkMode, 
    handleToggleCompactView 
  } = useAppearanceSettings();
  
  const { resetTutorialStatus } = useTutorial();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <span className="ml-2 text-gray-400">Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 glass-card p-6"
      >
        <h3 className="text-lg font-medium gradient-text flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Theme
        </h3>
        <div className="flex items-center justify-between bg-black/40 p-4 rounded-lg border border-purple-500/30">
          <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
            <span className="text-purple-300">Dark Mode</span>
            <span className="font-normal text-sm text-gray-400">
              Switch between light and dark theme
            </span>
          </Label>
          <Switch 
            id="dark-mode" 
            checked={darkMode}
            onCheckedChange={handleToggleDarkMode}
            className="data-[state=checked]:bg-purple-700"
          />
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4 glass-card p-6"
      >
        <h3 className="text-lg font-medium gradient-text flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Layout
        </h3>
        <div className="flex items-center justify-between bg-black/40 p-4 rounded-lg border border-purple-500/30">
          <Label htmlFor="compact-view" className="flex flex-col space-y-1">
            <span className="text-purple-300">Compact View</span>
            <span className="font-normal text-sm text-gray-400">
              Use a more compact layout for the interface
            </span>
          </Label>
          <Switch 
            id="compact-view" 
            checked={compactView}
            onCheckedChange={handleToggleCompactView}
            className="data-[state=checked]:bg-purple-700"
          />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4 glass-card p-6"
      >
        <h3 className="text-lg font-medium gradient-text flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Tutorial
        </h3>
        <div className="flex flex-col space-y-4 bg-black/40 p-4 rounded-lg border border-purple-500/30">
          <span className="text-sm text-gray-400">
            Restart the tutorial to learn about the platform's features
          </span>
          <Button 
            variant="outline" 
            onClick={resetTutorialStatus}
            className="flex items-center gap-2 bg-purple-900/40 border-purple-500/40 hover:bg-purple-800/50 transition-all duration-300 shadow-[0_5px_15px_rgba(147,51,234,0.3)]"
          >
            <RefreshCcw className="w-4 h-4 text-purple-300" />
            Restart Tutorial
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
