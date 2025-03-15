
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Save, 
  Shuffle, 
  Grid, 
  Plus, 
  Trash, 
  MoveHorizontal,
  ArrowUp,
  Users,
  ArrowsOutLineVertical
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Json = Database['public']['Tables']['seating_arrangements']['Row']['layout'];

interface Student {
  id: string;
  name: string;
}

interface Seat {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  studentId?: string;
  studentName?: string;
}

interface SeatingLayout {
  seats: Seat[];
}

interface DraggableSeatingChartProps {
  classroomId: string;
}

export const DraggableSeatingChart = ({ classroomId }: DraggableSeatingChartProps) => {
  const { toast } = useToast();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedSeatId, setDraggedSeatId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedStudent, setDraggedStudent] = useState<string | null>(null);
  const [isDraggingNewSeat, setIsDraggingNewSeat] = useState(false);
  const [newSeatPosition, setNewSeatPosition] = useState({ x: 0, y: 0 });
  const [defaultSeatSize, setDefaultSeatSize] = useState({ width: 120, height: 120 });
  const [resizingSeatId, setResizingSeatId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    fetchSeatingArrangement();
    fetchStudents();
  }, [classroomId]);

  const fetchStudents = async () => {
    try {
      const { data: classroomStudents, error: studentsError } = await supabase
        .from('classroom_students')
        .select('student_id')
        .eq('classroom_id', classroomId);

      if (studentsError) throw studentsError;

      if (classroomStudents && classroomStudents.length > 0) {
        const studentIds = classroomStudents.map(cs => cs.student_id);
        
        const { data: studentProfiles, error: profilesError } = await supabase
          .from('students')
          .select('id, name')
          .in('id', studentIds);

        if (profilesError) throw profilesError;

        if (studentProfiles) {
          setStudents(studentProfiles.map(profile => ({
            id: profile.id,
            name: profile.name || 'Unnamed Student'
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students"
      });
    }
  };

  const createDefaultSeatingArrangement = async () => {
    const defaultLayout: SeatingLayout = {
      seats: []
    };

    try {
      const { data, error } = await supabase
        .from('seating_arrangements')
        .insert({
          classroom_id: classroomId,
          layout: defaultLayout as unknown as Json,
          active: true
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const layout = data.layout as unknown as SeatingLayout;
        setSeats(layout.seats || []);
      }
    } catch (error) {
      console.error('Error creating default seating arrangement:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create default seating arrangement"
      });
    }
  };

  const fetchSeatingArrangement = async () => {
    try {
      const { data, error } = await supabase
        .from('seating_arrangements')
        .select('*')
        .eq('classroom_id', classroomId)
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const layout = data.layout as unknown as SeatingLayout;
        // Add width and height to any seats that don't have them
        const updatedSeats = (layout.seats || []).map(seat => ({
          ...seat,
          width: seat.width || defaultSeatSize.width,
          height: seat.height || defaultSeatSize.height
        }));
        setSeats(updatedSeats);
      } else {
        await createDefaultSeatingArrangement();
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

  const saveSeatingArrangement = async () => {
    try {
      const layout: SeatingLayout = {
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

  const handleMouseDown = (e: React.MouseEvent, seatId: string) => {
    if (!isEditing) return;
    
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setDraggedSeatId(seatId);
  };

  const handleResizeStart = (e: React.MouseEvent, seatId: string, direction: string) => {
    e.stopPropagation();
    if (!isEditing) return;
    
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;
    
    setResizingSeatId(seatId);
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ width: seat.width, height: seat.height });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Handle moving existing seats
    if (isEditing && draggedSeatId) {
      const x = e.clientX - containerRect.left - dragOffset.x;
      const y = e.clientY - containerRect.top - dragOffset.y;
      
      setSeats(prevSeats => 
        prevSeats.map(seat => 
          seat.id === draggedSeatId 
            ? { ...seat, x, y } 
            : seat
        )
      );
    }
    
    // Handle resizing seats
    if (isEditing && isResizing && resizingSeatId && resizeDirection) {
      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;
      const minSize = 80; // Minimum seat size

      setSeats(prevSeats => 
        prevSeats.map(seat => {
          if (seat.id !== resizingSeatId) return seat;
          
          let newWidth = resizeStartSize.width;
          let newHeight = resizeStartSize.height;
          
          if (resizeDirection === 'se' || resizeDirection === 'ne' || resizeDirection === 'e') {
            newWidth = Math.max(minSize, resizeStartSize.width + deltaX);
          }
          
          if (resizeDirection === 'se' || resizeDirection === 'sw' || resizeDirection === 's') {
            newHeight = Math.max(minSize, resizeStartSize.height + deltaY);
          }
          
          return { ...seat, width: newWidth, height: newHeight };
        })
      );
    }
    
    // Handle creating new seats
    if (isEditing && isDraggingNewSeat) {
      setNewSeatPosition({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedSeatId(null);
    setIsResizing(false);
    setResizingSeatId(null);
    
    if (isDraggingNewSeat) {
      // Add the new seat at the current position
      const newSeat: Seat = {
        id: `seat-${Date.now()}`,
        x: newSeatPosition.x,
        y: newSeatPosition.y,
        width: defaultSeatSize.width,
        height: defaultSeatSize.height
      };
      
      setSeats(prevSeats => [...prevSeats, newSeat]);
      setIsDraggingNewSeat(false);
    }
  };

  const handleAddSeat = () => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    setIsDraggingNewSeat(true);
    setNewSeatPosition({
      x: containerRect.width / 2,
      y: containerRect.height / 2
    });
  };

  const handleRemoveSeat = (seatId: string) => {
    setSeats(prevSeats => prevSeats.filter(seat => seat.id !== seatId));
  };

  const startDragStudent = (e: React.DragEvent, studentId: string) => {
    e.dataTransfer.setData('text/plain', studentId);
    setDraggedStudent(studentId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnSeat = (e: React.DragEvent, seatId: string) => {
    e.preventDefault();
    
    const studentId = e.dataTransfer.getData('text/plain');
    if (!studentId) return;
    
    // Find the student to get their name
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Update the seat with the student
    setSeats(prevSeats => 
      prevSeats.map(seat => 
        seat.id === seatId 
          ? { ...seat, studentId, studentName: student.name } 
          : seat
      )
    );
    
    setDraggedStudent(null);
  };

  const handleRemoveStudentFromSeat = (seatId: string) => {
    setSeats(prevSeats => 
      prevSeats.map(seat => 
        seat.id === seatId 
          ? { ...seat, studentId: undefined, studentName: undefined } 
          : seat
      )
    );
  };

  const randomizeStudents = () => {
    // Remove all students from seats
    const emptySeats = seats.map(seat => ({
      ...seat,
      studentId: undefined,
      studentName: undefined
    }));
    
    // Shuffle the students array
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    
    // Assign students to seats, but only if there are enough seats
    const assignedSeats = emptySeats.map((seat, index) => {
      if (index < shuffledStudents.length) {
        return {
          ...seat,
          studentId: shuffledStudents[index].id,
          studentName: shuffledStudents[index].name
        };
      }
      return seat;
    });
    
    setSeats(assignedSeats);
    toast({
      title: "Students Randomized",
      description: `Assigned ${Math.min(shuffledStudents.length, emptySeats.length)} students to seats`
    });
  };

  const handleSeatSizeChange = (value: number[]) => {
    const newWidth = value[0];
    const newHeight = value[0]; // keeping aspect ratio 1:1 for simplicity
    
    setDefaultSeatSize({ width: newWidth, height: newHeight });
  };

  return (
    <Card className="p-6 glass-card">
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
                onClick={handleAddSeat}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Seat
              </Button>
              <Button
                variant="outline"
                onClick={saveSeatingArrangement}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Layout
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={randomizeStudents}
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
                <ArrowsOutLineVertical className="w-4 h-4" />
                <Slider 
                  className="w-full" 
                  defaultValue={[defaultSeatSize.width]}
                  max={200} 
                  min={80} 
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Student list (left panel) */}
        <div className="bg-purple-900/10 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Students
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {students.map(student => (
              <div
                key={student.id}
                draggable
                onDragStart={(e) => startDragStudent(e, student.id)}
                className="bg-purple-700/20 p-2 rounded-md cursor-grab hover:bg-purple-700/30 transition-colors"
              >
                {student.name}
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-sm text-gray-400">No students in this class</p>
            )}
          </div>
        </div>

        {/* Classroom layout (right panel) */}
        <div 
          className="col-span-3 relative" 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Chalkboard indicator for classroom orientation */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-green-900/50 rounded-t-lg flex items-center justify-center">
            <ArrowUp className="w-5 h-5 mr-2" />
            <span className="text-white font-medium">Front of Classroom (Board)</span>
          </div>
          
          {/* Seating area */}
          <div 
            className="bg-gray-800/30 rounded-lg p-4 min-h-[500px] mt-12 relative"
            onDragOver={handleDragOver}
          >
            {seats.map(seat => (
              <div
                key={seat.id}
                className={`absolute rounded-lg flex flex-col items-center justify-center 
                  transition-colors
                  ${seat.studentId ? 'bg-purple-600' : 'bg-gray-700/50'}
                  ${isEditing ? 'cursor-move' : 'cursor-default'}
                  ${draggedSeatId === seat.id ? 'z-10 opacity-80' : 'z-0'}
                  hover:bg-opacity-90`}
                style={{
                  left: `${seat.x}px`,
                  top: `${seat.y}px`,
                  width: `${seat.width}px`,
                  height: `${seat.height}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseDown={(e) => handleMouseDown(e, seat.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnSeat(e, seat.id)}
              >
                <div className="text-center overflow-hidden w-full px-2">
                  {seat.studentName ? (
                    <>
                      <p className="font-medium text-sm truncate">{seat.studentName}</p>
                      {isEditing && (
                        <button 
                          onClick={() => handleRemoveStudentFromSeat(seat.id)}
                          className="text-xs text-red-300 hover:text-red-100 mt-1"
                        >
                          Remove
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-300">Empty Seat</p>
                  )}
                </div>
                {isEditing && (
                  <>
                    <button
                      onClick={() => handleRemoveSeat(seat.id)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                    
                    {/* Resize handles */}
                    <div 
                      className="absolute bottom-0 right-0 w-4 h-4 bg-white/30 rounded-bl-md cursor-se-resize"
                      onMouseDown={(e) => handleResizeStart(e, seat.id, 'se')}
                    />
                  </>
                )}
              </div>
            ))}
            
            {/* Visual indicator for new seat being created */}
            {isDraggingNewSeat && (
              <div
                className="absolute rounded-lg bg-purple-500/50 border-2 border-dashed border-purple-300 flex items-center justify-center"
                style={{
                  left: `${newSeatPosition.x}px`,
                  top: `${newSeatPosition.y}px`,
                  width: `${defaultSeatSize.width}px`,
                  height: `${defaultSeatSize.height}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 20
                }}
              >
                <p className="text-sm">New Seat</p>
              </div>
            )}
            
            {seats.length === 0 && !isDraggingNewSeat && (
              <div className="flex flex-col items-center justify-center h-full">
                <Grid className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-400">
                  {isEditing 
                    ? "Click 'Add Seat' to create seats"
                    : "No seats have been created yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
