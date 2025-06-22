
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Palette, Type, Monitor, Globe } from "lucide-react";

interface AppearanceSettingsTabProps {
  settings: {
    theme: string;
    font_size: number;
    compact_mode: boolean;
    language: string;
  };
  onUpdate: (settings: any) => void;
}

export const AppearanceSettingsTab = ({ settings, onUpdate }: AppearanceSettingsTabProps) => {
  const handleSettingChange = (key: string, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Appearance Settings
        </CardTitle>
        <CardDescription className="text-gray-400">
          Customize the look and feel of your interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-blue-400" />
            <Label className="text-white font-medium">Theme</Label>
          </div>
          <Select
            value={settings.theme}
            onValueChange={(value) => handleSettingChange('theme', value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="auto">Auto (System)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-green-400" />
            <Label className="text-white font-medium">Font Size: {settings.font_size}px</Label>
          </div>
          <Slider
            value={[settings.font_size]}
            onValueChange={(value) => handleSettingChange('font_size', value[0])}
            max={20}
            min={12}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-purple-400" />
            <Label className="text-white font-medium">Language</Label>
          </div>
          <Select
            value={settings.language}
            onValueChange={(value) => handleSettingChange('language', value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div className="space-y-1">
            <Label className="text-white font-medium">Compact Mode</Label>
            <p className="text-sm text-gray-400">Use a more condensed layout</p>
          </div>
          <Switch
            checked={settings.compact_mode}
            onCheckedChange={(checked) => handleSettingChange('compact_mode', checked)}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>

        <Button 
          onClick={() => onUpdate(settings)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold transition-colors"
        >
          Save Appearance Settings
        </Button>
      </CardContent>
    </Card>
  );
};
