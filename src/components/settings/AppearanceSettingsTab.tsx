
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";

interface AppearanceSettingsTabProps {
  theme: string;
  setTheme: (value: string) => void;
  fontSize: number[];
  setFontSize: (value: number[]) => void;
  compactMode: boolean;
  setCompactMode: (value: boolean) => void;
  onSave: () => void;
}

export const AppearanceSettingsTab = ({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  compactMode,
  setCompactMode,
  onSave
}: AppearanceSettingsTabProps) => {
  console.log('AppearanceSettingsTab rendered with:', { theme, fontSize, compactMode });

  return (
    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-500" />
          Appearance Settings
        </CardTitle>
        <CardDescription className="text-gray-400">
          Customize the look and feel of your interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
          <div>
            <Label className="text-white font-medium mb-3 block">Theme Preference</Label>
            <Select 
              value={theme} 
              onValueChange={(value) => {
                console.log('Theme changed to:', value);
                setTheme(value);
              }}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="dark" className="text-white hover:bg-gray-700">Dark Theme</SelectItem>
                <SelectItem value="light" className="text-white hover:bg-gray-700">Light Theme</SelectItem>
                <SelectItem value="system" className="text-white hover:bg-gray-700">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg space-y-4">
          <div>
            <Label className="text-white font-medium">Font Size: {fontSize[0]}px</Label>
            <p className="text-sm text-gray-400 mb-3">
              Adjust the text size throughout the application
            </p>
            <Slider
              value={fontSize}
              onValueChange={(value) => {
                console.log('Font size changed to:', value);
                setFontSize(value);
              }}
              max={20}
              min={12}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Label className="text-white font-medium">Compact Mode</Label>
              <p className="text-sm text-gray-400">
                Use a more compact interface layout to fit more content on screen
              </p>
            </div>
            <Switch
              checked={compactMode}
              onCheckedChange={(checked) => {
                console.log('Compact mode changed to:', checked);
                setCompactMode(checked);
              }}
              className="data-[state=checked]:bg-purple-600 ml-4"
            />
          </div>
        </div>

        <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
            <div>
              <h4 className="text-blue-200 font-medium mb-1">Appearance Tips</h4>
              <p className="text-blue-300 text-sm">
                Your appearance settings will be applied immediately. Dark theme is recommended for extended use.
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => {
            console.log('Saving appearance settings...');
            onSave();
          }}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold transition-colors"
        >
          Save Appearance Settings
        </Button>
      </CardContent>
    </Card>
  );
};
