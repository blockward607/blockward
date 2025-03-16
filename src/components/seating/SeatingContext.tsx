
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Seat, Student } from './types';

interface SeatingContextType {
  seats: Seat[];
  setSeats: React.Dispatch<React.SetStateAction<Seat[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  draggedSeatId: string | null;
  setDraggedSeatId: React.Dispatch<React.SetStateAction<string | null>>;
  dragOffset: { x: number; y: number };
  setDragOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  containerRef: HTMLDivElement | null;
  setContainerRef: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
  draggedStudent: string | null;
  setDraggedStudent: React.Dispatch<React.SetStateAction<string | null>>;
  isDraggingNewSeat: boolean;
  setIsDraggingNewSeat: React.Dispatch<React.SetStateAction<boolean>>;
  newSeatPosition: { x: number; y: number };
  setNewSeatPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  defaultSeatSize: { width: number; height: number };
  setDefaultSeatSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
  resizingSeatId: string | null;
  setResizingSeatId: React.Dispatch<React.SetStateAction<string | null>>;
  isResizing: boolean;
  setIsResizing: React.Dispatch<React.SetStateAction<boolean>>;
  resizeDirection: string | null;
  setResizeDirection: React.Dispatch<React.SetStateAction<string | null>>;
  resizeStartPos: { x: number; y: number };
  setResizeStartPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  resizeStartSize: { width: number; height: number };
  setResizeStartSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
}

const SeatingContext = createContext<SeatingContextType | undefined>(undefined);

export const SeatingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedSeatId, setDraggedSeatId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [draggedStudent, setDraggedStudent] = useState<string | null>(null);
  const [isDraggingNewSeat, setIsDraggingNewSeat] = useState(false);
  const [newSeatPosition, setNewSeatPosition] = useState({ x: 0, y: 0 });
  const [defaultSeatSize, setDefaultSeatSize] = useState({ width: 120, height: 120 });
  const [resizingSeatId, setResizingSeatId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });

  return (
    <SeatingContext.Provider
      value={{
        seats,
        setSeats,
        students,
        setStudents,
        isEditing,
        setIsEditing,
        draggedSeatId,
        setDraggedSeatId,
        dragOffset,
        setDragOffset,
        containerRef,
        setContainerRef,
        draggedStudent,
        setDraggedStudent,
        isDraggingNewSeat,
        setIsDraggingNewSeat,
        newSeatPosition,
        setNewSeatPosition,
        defaultSeatSize,
        setDefaultSeatSize,
        resizingSeatId,
        setResizingSeatId,
        isResizing,
        setIsResizing,
        resizeDirection,
        setResizeDirection,
        resizeStartPos,
        setResizeStartPos,
        resizeStartSize,
        setResizeStartSize
      }}
    >
      {children}
    </SeatingContext.Provider>
  );
};

export const useSeating = () => {
  const context = useContext(SeatingContext);
  if (context === undefined) {
    throw new Error('useSeating must be used within a SeatingProvider');
  }
  return context;
};
