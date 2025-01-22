import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid, Save, Edit, Plus, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

interface Seat {
  id: number;
  row: number;
  col: number;
  studentId?: string;
  occupied: boolean;
}

interface SeatingLayout {
  rows: number;
  columns: number;
  seats: Seat[];
}

interface SeatingChartProps {
  classroomId: string;
}

export const SeatingChart = ({ classroomId }: SeatingChartProps) => {
  const { toast } = useToast();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSeatingArrangement();
  }, [classroomId]);

  const fetchSeatingArrangement = async () => {
    try {
      const { data, error } = await supabase
        .from('seating_arrangements')
        .select('*')
        .eq('classroom_id', classroomId)
        .eq('active', true)
        .single();

      if (error) throw error;

      if (data) {
        const layout = data.layout as SeatingLayout;
        setSeats(layout.seats || []);
        setRows(layout.rows || 5);
        setCols(layout.columns || 6);
      }
    } catch (error) {
      console.error('Error fetching seating arrangement:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load seating arrangement"
      });
    }
  };

  const toggleSeat = (row: number, col: number) => {
    if (!isEditing) return;

    setSeats(prevSeats => {
      const existingSeatIndex = prevSeats.findIndex(
        seat => seat.row === row && seat.col === col
      );

      if (existingSeatIndex >= 0) {
        return prevSeats.filter((_, index) => index !== existingSeatIndex);
      }

      return [...prevSeats, { id: Date.now(), row, col, occupied: false }];
    });
  };

  const saveSeatingArrangement = async () => {
    try {
      const layout: SeatingLayout = {
        rows,
        columns: cols,
        seats
      };

      const { error } = await supabase
        .from('seating_arrangements')
        .upsert({
          classroom_id: classroomId,
          layout: layout as unknown as Json,
          active: true
        });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Seating arrangement saved successfully"
      });
    } catch (error) {
      console.error('Error saving seating arrangement:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save seating arrangement"
      });
    }
  };

  return (
    <Card className="p-6 glass-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold gradient-text">Seating Chart</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            {isEditing ? 'Save' : 'Edit'}
          </Button>
          {isEditing && (
            <Button
              variant="outline"
              onClick={saveSeatingArrangement}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Layout
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 p-4 bg-purple-900/10 rounded-lg">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-4 justify-center">
            {Array.from({ length: cols }).map((_, col) => {
              const seat = seats.find(s => s.row === row && s.col === col);
              return (
                <button
                  key={`${row}-${col}`}
                  onClick={() => toggleSeat(row, col)}
                  className={`w-12 h-12 rounded-lg transition-all ${
                    seat
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {seat?.occupied && '👤'}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="mt-4 flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => setRows(r => Math.min(r + 1, 10))}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Row
          </Button>
          <Button
            variant="outline"
            onClick={() => setCols(c => Math.min(c + 1, 12))}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Column
          </Button>
          <Button
            variant="outline"
            onClick={() => setRows(r => Math.max(r - 1, 1))}
            className="flex items-center gap-2"
          >
            <Trash className="w-4 h-4" /> Remove Row
          </Button>
          <Button
            variant="outline"
            onClick={() => setCols(c => Math.max(c - 1, 1))}
            className="flex items-center gap-2"
          >
            <Trash className="w-4 h-4" /> Remove Column
          </Button>
        </div>
      )}
    </Card>
  );
};