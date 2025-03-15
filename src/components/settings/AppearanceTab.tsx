
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { Button } from "@/components/ui/button";
import { useTutorial } from "@/hooks/useTutorial";
import { RefreshCcw } from "lucide-react";

export const AppearanceTab = () => {
  const { 
    darkMode, 
    compactView, 
    handleToggleDarkMode, 
    handleToggleCompactView 
  } = useAppearanceSettings();
  
  const { resetTutorialStatus } = useTutorial();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Theme</h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
            <span>Dark Mode</span>
            <span className="font-normal text-sm text-gray-500 dark:text-gray-400">
              Switch between light and dark theme
            </span>
          </Label>
          <Switch 
            id="dark-mode" 
            checked={darkMode}
            onCheckedChange={handleToggleDarkMode}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Layout</h3>
        <div className="flex items-center justify-between">
          <Label htmlFor="compact-view" className="flex flex-col space-y-1">
            <span>Compact View</span>
            <span className="font-normal text-sm text-gray-500 dark:text-gray-400">
              Use a more compact layout for the interface
            </span>
          </Label>
          <Switch 
            id="compact-view" 
            checked={compactView}
            onCheckedChange={handleToggleCompactView}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Tutorial</h3>
        <div className="flex flex-col space-y-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Restart the tutorial to learn about the platform's features
          </span>
          <Button 
            variant="outline" 
            onClick={resetTutorialStatus}
            className="flex items-center gap-2 bg-purple-700/20 border-purple-500/30 hover:bg-purple-700/30"
          >
            <RefreshCcw className="w-4 h-4" />
            Restart Tutorial
          </Button>
        </div>
      </div>
    </div>
  );
};
