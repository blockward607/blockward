
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";

const AppearanceTab = () => {
  const {
    darkMode,
    compactView,
    handleToggleDarkMode,
    handleToggleCompactView
  } = useAppearanceSettings();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Dark Mode</Label>
            <p className="text-sm text-gray-400">Toggle dark mode theme</p>
          </div>
          <Switch 
            checked={darkMode}
            onCheckedChange={handleToggleDarkMode}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Compact View</Label>
            <p className="text-sm text-gray-400">Use compact layout for lists and tables</p>
          </div>
          <Switch 
            checked={compactView}
            onCheckedChange={handleToggleCompactView}
          />
        </div>
      </div>
    </div>
  );
};

export default AppearanceTab;
