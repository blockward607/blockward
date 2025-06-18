
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Appearance Settings</CardTitle>
        <CardDescription>Customize the look and feel of your interface</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-white">Theme</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-white">Font Size: {fontSize[0]}px</Label>
          <Slider
            value={fontSize}
            onValueChange={setFontSize}
            max={20}
            min={12}
            step={1}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-white">Compact Mode</Label>
            <p className="text-sm text-gray-400">Use a more compact interface layout</p>
          </div>
          <Switch
            checked={compactMode}
            onCheckedChange={setCompactMode}
          />
        </div>

        <Button 
          onClick={onSave}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Save Appearance Settings
        </Button>
      </CardContent>
    </Card>
  );
};
