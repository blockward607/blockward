
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Seat, Student, SeatingLayout, Json } from './types';

export const useSeatingData = (classroomId: string) => {
  const { toast } = useToast();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [defaultSeatSize] = useState({ width: 120, height: 120 });

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
    } finally {
      setLoading(false);
    }
  };

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

  const saveSeatingArrangement = async (seats: Seat[]) => {
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

      toast({
        title: "Success",
        description: "Seating arrangement saved successfully"
      });
      
      return true;
    } catch (error) {
      console.error('Error saving seating arrangement:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save seating arrangement"
      });
      
      return false;
    }
  };

  useEffect(() => {
    fetchSeatingArrangement();
    fetchStudents();
  }, [classroomId]);

  return {
    seats,
    setSeats,
    students,
    loading,
    saveSeatingArrangement,
    fetchSeatingArrangement,
    fetchStudents
  };
};
