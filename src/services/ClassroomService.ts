
import { supabase } from '@/integrations/supabase/client';

export const ClassroomService = {
  // Generate a unique class code for teacher
  generateClassCode: async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  },
  
  // Get all students for a teacher
  getTeacherStudents: async (teacherId: string) => {
    console.log('Getting students for teacher:', teacherId);
    
    // Get all classrooms for this teacher
    const { data: classrooms, error: classroomsError } = await supabase
      .from('classrooms')
      .select('id')
      .eq('teacher_id', teacherId);
      
    if (classroomsError) {
      console.error('Error getting teacher classrooms:', classroomsError);
      throw classroomsError;
    }
    
    if (!classrooms || classrooms.length === 0) {
      return { data: [] };
    }
    
    // Get all students enrolled in these classrooms
    const classroomIds = classrooms.map(c => c.id);
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('classroom_students')
      .select('student_id')
      .in('classroom_id', classroomIds);
      
    if (enrollmentsError) {
      console.error('Error getting enrollments:', enrollmentsError);
      throw enrollmentsError;
    }
    
    if (!enrollments || enrollments.length === 0) {
      return { data: [] };
    }
    
    // Get the actual student data
    const studentIds = [...new Set(enrollments.map(e => e.student_id))]; // Remove duplicates
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .in('id', studentIds);
      
    if (studentsError) {
      console.error('Error getting students:', studentsError);
      throw studentsError;
    }
    
    return { data: students || [] };
  }
};
