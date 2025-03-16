
import { supabase } from '@/integrations/supabase/client';
import { InviteUtils } from './InviteUtils';

export const AuthService = {
  // Check if a user role exists
  checkUserRole: async (userId: string) => {
    console.log('Checking user role for:', userId);
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error && !error.message.includes('No rows found')) {
      console.error('Error checking user role:', error);
      throw error;
    }
    
    return { data, error };
  },
  
  // Create a user role
  createUserRole: async (userId: string, role: 'teacher' | 'student') => {
    console.log('Creating user role:', { userId, role });
    const { data, error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user role:', error);
      throw error;
    }
    
    console.log('User role created successfully:', data);
    return { data, error };
  },
  
  // Check if a wallet exists
  checkUserWallet: async (userId: string) => {
    console.log('Checking wallet for user:', userId);
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error && !error.message.includes('No rows found')) {
      console.error('Error checking user wallet:', error);
      throw error;
    }
    
    return { data, error };
  },
  
  // Create a user wallet
  createUserWallet: async (userId: string, type: 'user' | 'admin', address: string) => {
    console.log('Creating wallet:', { userId, type, address });
    const { data, error } = await supabase
      .from('wallets')
      .insert({ 
        user_id: userId, 
        type,
        address
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user wallet:', error);
      throw error;
    }
    
    console.log('Wallet created successfully:', data);
    return { data, error };
  },
  
  // Check if a teacher profile exists
  checkTeacherProfile: async (userId: string) => {
    console.log('Checking teacher profile for:', userId);
    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error && !error.message.includes('No rows found')) {
      console.error('Error checking teacher profile:', error);
      throw error;
    }
    
    return { data, error };
  },
  
  // Create a teacher profile
  createTeacherProfile: async (userId: string, school?: string, subject?: string, fullName?: string) => {
    console.log('Creating teacher profile for:', userId);
    const { data, error } = await supabase
      .from('teacher_profiles')
      .insert({ 
        user_id: userId,
        school: school || '',
        subject: subject || '',
        full_name: fullName || '',
        remaining_credits: 1000
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating teacher profile:', error);
      throw error;
    }
    
    console.log('Teacher profile created successfully:', data);
    return { data, error };
  },
  
  // Check if a student profile exists
  checkStudentProfile: async (userId: string) => {
    console.log('Checking student profile for:', userId);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error && !error.message.includes('No rows found')) {
      console.error('Error checking student profile:', error);
      throw error;
    }
    
    return { data, error };
  },
  
  // Create a student profile
  createStudentProfile: async (userId: string, email: string, name?: string, school?: string) => {
    const username = name || email.split('@')[0];
    console.log('Creating student profile:', { userId, username, school });
    
    const { data, error } = await supabase
      .from('students')
      .insert({
        user_id: userId,
        name: username,
        school: school || '',
        points: 0
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating student profile:', error);
      throw error;
    }
    
    console.log('Student profile created successfully:', data);
    return { data, error };
  },
  
  // Generate a unique class code for teacher
  generateClassCode: async () => {
    return InviteUtils.generateInvitationToken();
  },
  
  // Validate an invitation code
  validateInvitationCode: async (code: string) => {
    return InviteUtils.validateInvitationCode(code);
  },
  
  // Enroll a student in a classroom
  enrollStudentInClassroom: async (studentId: string, classroomId: string) => {
    console.log('Enrolling student in classroom:', { studentId, classroomId });
    
    try {
      // First check if student is already enrolled
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('classroom_students')
        .select('*')
        .eq('student_id', studentId)
        .eq('classroom_id', classroomId)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking enrollment:', checkError);
        throw checkError;
      }
        
      if (existingEnrollment) {
        console.log('Student already enrolled in this classroom');
        return { data: existingEnrollment, alreadyEnrolled: true };
      }
      
      // If not enrolled, add the student to the classroom
      const { data, error } = await supabase
        .from('classroom_students')
        .insert({
          student_id: studentId,
          classroom_id: classroomId
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error enrolling student:', error);
        throw error;
      }
      
      console.log('Student enrolled successfully:', data);
      return { data, alreadyEnrolled: false };
    } catch (error) {
      console.error('Exception enrolling student:', error);
      throw error;
    }
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
  },
  
  // Generate and store classroom invitation
  createClassInvitation: async (classroomId: string, email: string = 'general_invitation@blockward.app') => {
    return InviteUtils.createInvitation(classroomId, email);
  },
  
  // Send email invitation to a student
  sendEmailInvitation: async (email: string, teacherName: string, classroomName: string, invitationToken: string) => {
    return InviteUtils.sendEmailInvitation(email, invitationToken, teacherName, classroomName);
  }
};
