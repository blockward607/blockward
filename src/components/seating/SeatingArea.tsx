
import React from 'react';
import { Grid, ArrowUp } from 'lucide-react';
import { useSeating } from './SeatingContext';
import { SeatItem } from './SeatItem';

interface SeatingAreaProps {
  onRemoveSeat: (seatId: string) => void;
  onRemoveStudentFromSeat: (seatId: string) => void;
  onDropOnSeat: (e: React.DragEvent, seatId: string) => void;
}

export const SeatingArea: React.FC<SeatingAreaProps> = ({
  onRemoveSeat,
  onRemoveStudentFromSeat,
  onDropOnSeat
}) => {
  const {
    seats,
    setContainerRef,
    isDraggingNewSeat,
    newSeatPosition,
    defaultSeatSize
  } = useSeating();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="col-span-3 relative">
      <div className="absolute top-0 left-0 right-0 h-12 bg-green-900/50 rounded-t-lg flex items-center justify-center">
        <ArrowUp className="w-5 h-5 mr-2" />
        <span className="text-white font-medium">Front of Classroom (Board)</span>
      </div>
      
      <div 
        className="bg-gray-800/30 rounded-lg p-4 min-h-[500px] mt-12 relative will-change-auto"
        ref={setContainerRef}
        onDragOver={handleDragOver}
      >
        {seats.map(seat => (
          <SeatItem
            key={seat.id}
            seat={seat}
            onRemoveSeat={onRemoveSeat}
            onRemoveStudentFromSeat={onRemoveStudentFromSeat}
          />
        ))}
        
        {isDraggingNewSeat && (
          <div
            className="absolute rounded-lg bg-purple-500/50 border-2 border-dashed border-purple-300 flex items-center justify-center will-change-auto"
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
              {useSeating().isEditing 
                ? "Click 'Add Seat' to create seats"
                : "No seats have been created yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
