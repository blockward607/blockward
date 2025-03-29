
import { supabase } from "@/integrations/supabase/client";
import { JoinClassroomResult } from "../types";

/**
 * Attempts to find a classroom by its direct ID
 */
export const findClassroomById = async (
  possibleClassroomId: string
): Promise<{ data: JoinClassroomResult | null; error: { message: string } | null }> => {
  console.log("[findClassroomById] Looking for classroom by ID:", possibleClassroomId);
  
  // Try to find classroom by ID (legacy support)
  const { data: classroom, error: classroomError } = await supabase
    .from('classrooms')
    .select('id, name, description, teacher_id')
    .eq('id', possibleClassroomId)
    .maybeSingle();
    
  if (classroomError && !classroomError.message.includes('No rows found')) {
    console.error("[findClassroomById] Error checking classroom:", classroomError);
    return { 
      data: null, 
      error: { message: "Error checking classroom" } 
    };
  }
  
  if (classroom) {
    console.log("[findClassroomById] Found matching classroom by ID:", classroom);
    return { 
      data: {
        classroomId: classroom.id,
        classroom: classroom
      }, 
      error: null 
    };
  }
  
  // No classroom found by ID
  return { data: null, error: null };
};
