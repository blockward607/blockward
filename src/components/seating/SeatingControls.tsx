
import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Save, Shuffle, Plus, ArrowUpDown } from 'lucide-react';
import { useSeating } from './SeatingContext';

interface SeatingControlsProps {
  onAddSeat: () => void;
  onSave: () => void;
  onRandomize: () => void;
}

export const SeatingControls: React.FC<SeatingControlsProps> = ({
  onAddSeat,
  onSave,
  onRandomize
}) => {
  const {
    seats,
    isEditing,
    setIsEditing,
    defaultSeatSize,
    setDefaultSeatSize
  } = useSeating();

  const handleSeatSizeChange = (value: number[]) => {
    const newWidth = value[0];
    const newHeight = value[0];
    
    setDefaultSeatSize({ width: newWidth, height: newHeight });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold gradient-text">Classroom Seating Plan</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            {isEditing ? "Exit Edit Mode" : "Edit Seats"}
          </Button>
          {isEditing && (
            <>
              <Button
                variant="outline"
                onClick={onAddSeat}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Seat
              </Button>
              <Button
                variant="outline"
                onClick={onSave}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Layout
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={onRandomize}
            className="flex items-center gap-2"
            disabled={seats.length === 0}
          >
            <Shuffle className="w-4 h-4" />
            Randomize
          </Button>
        </div>
      </div>

      {isEditing && (
        <div className="mb-6 bg-purple-900/10 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="w-1/3">
              <label className="text-sm font-medium mb-2 block">Default Seat Size</label>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <Slider 
                  className="w-full" 
                  defaultValue={[defaultSeatSize.width]}
                  max={200} 
                  min={40} 
                  step={10}
                  onValueChange={handleSeatSizeChange}
                />
                <span className="text-xs">{defaultSeatSize.width}px</span>
              </div>
            </div>
            <div className="ml-8 text-sm text-gray-400">
              <p>• Drag seats to position them</p>
              <p>• Use corner handles to resize seats</p>
              <p>• Drag students onto seats to assign them</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
