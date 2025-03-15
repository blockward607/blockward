
import React from 'react';
import { Trash } from 'lucide-react';
import { useSeating } from './SeatingContext';
import { Seat } from './types';

interface SeatItemProps {
  seat: Seat;
  onRemoveSeat: (seatId: string) => void;
  onRemoveStudentFromSeat: (seatId: string) => void;
}

export const SeatItem: React.FC<SeatItemProps> = ({
  seat,
  onRemoveSeat,
  onRemoveStudentFromSeat
}) => {
  const {
    isEditing,
    draggedSeatId,
    setDraggedSeatId,
    setDragOffset,
    setResizingSeatId,
    setIsResizing,
    setResizeDirection,
    setResizeStartPos,
    setResizeStartSize
  } = useSeating();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setDraggedSeatId(seat.id);
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    if (!isEditing) return;
    
    setResizingSeatId(seat.id);
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ width: seat.width, height: seat.height });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const studentId = e.dataTransfer.getData('text/plain');
    if (!studentId) return;
  };

  return (
    <div
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
      onMouseDown={handleMouseDown}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="text-center overflow-hidden w-full px-2">
        {seat.studentName ? (
          <>
            <p className="font-medium text-sm truncate">{seat.studentName}</p>
            {isEditing && (
              <button 
                onClick={() => onRemoveStudentFromSeat(seat.id)}
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
            onClick={() => onRemoveSeat(seat.id)}
            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
          >
            <Trash className="w-3 h-3" />
          </button>
          
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 bg-white/30 rounded-bl-md cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
        </>
      )}
    </div>
  );
};
