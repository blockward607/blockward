
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SeatingProvider, useSeating } from './SeatingContext';
import { useSeatingData } from './useSeatingData';
import { StudentList } from './StudentList';
import { SeatingArea } from './SeatingArea';
import { SeatingControls } from './SeatingControls';

interface DraggableSeatingChartProps {
  classroomId: string;
}

const DraggableSeatingChartContent = ({ classroomId }: DraggableSeatingChartProps) => {
  const { toast } = useToast();
  const {
    seats,
    setSeats,
    students,
    setStudents,
    isEditing,
    setIsEditing,
    draggedSeatId,
    setDraggedSeatId,
    containerRef,
    draggedStudent,
    setDraggedStudent,
    isDraggingNewSeat,
    setIsDraggingNewSeat,
    newSeatPosition,
    setNewSeatPosition,
    defaultSeatSize,
    isResizing,
    resizingSeatId,
    resizeDirection,
    resizeStartPos,
    resizeStartSize
  } = useSeating();
  
  const {
    seats: fetchedSeats,
    students: fetchedStudents,
    saveSeatingArrangement
  } = useSeatingData(classroomId);

  useEffect(() => {
    setSeats(fetchedSeats);
  }, [fetchedSeats, setSeats]);

  useEffect(() => {
    setStudents(fetchedStudents);
  }, [fetchedStudents, setStudents]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef) return;
    
    const containerRect = containerRef.getBoundingClientRect();
    
    if (isEditing && draggedSeatId) {
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;
      
      setSeats(prevSeats => 
        prevSeats.map(seat => 
          seat.id === draggedSeatId 
            ? { ...seat, x, y } 
            : seat
        )
      );
    }
    
    if (isEditing && isResizing && resizingSeatId && resizeDirection) {
      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;
      const minSize = 40;
      
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
    
    if (isEditing && isDraggingNewSeat) {
      setNewSeatPosition({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedSeatId(null);
    
    if (isDraggingNewSeat) {
      const newSeat = {
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
    if (!containerRef) return;
    
    const containerRect = containerRef.getBoundingClientRect();
    setIsDraggingNewSeat(true);
    setNewSeatPosition({
      x: containerRect.width / 2,
      y: containerRect.height / 2
    });
  };

  const handleRemoveSeat = (seatId: string) => {
    setSeats(prevSeats => prevSeats.filter(seat => seat.id !== seatId));
  };

  const handleDropOnSeat = (e: React.DragEvent, seatId: string) => {
    e.preventDefault();
    
    const studentId = e.dataTransfer.getData('text/plain');
    if (!studentId) return;
    
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
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
    const emptySeats = seats.map(seat => ({
      ...seat,
      studentId: undefined,
      studentName: undefined
    }));
    
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    
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

  const handleSaveArrangement = async () => {
    const success = await saveSeatingArrangement(seats);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <Card className="p-6 glass-card">
      <div 
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="will-change-auto" // Add this to prevent blurry icons
      >
        <SeatingControls
          onAddSeat={handleAddSeat}
          onSave={handleSaveArrangement}
          onRandomize={randomizeStudents}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StudentList />
          <SeatingArea
            onRemoveSeat={handleRemoveSeat}
            onRemoveStudentFromSeat={handleRemoveStudentFromSeat}
            onDropOnSeat={handleDropOnSeat}
          />
        </div>
      </div>
    </Card>
  );
};

export const DraggableSeatingChart = ({ classroomId }: DraggableSeatingChartProps) => {
  return (
    <SeatingProvider>
      <DraggableSeatingChartContent classroomId={classroomId} />
    </SeatingProvider>
  );
};
