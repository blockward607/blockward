
import { supabase } from "@/integrations/supabase/client";
import { ToastType } from "@/hooks/use-toast";

export const handleJoinClassWithCode = async (invitationCode: string, toast: ToastType) => {
  console.log('Starting join class process with code:', invitationCode);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: "You must be logged in to join a class"
    });
    throw new Error("Authentication required");
  }

  console.log('Validating invitation code...');
  const { data: invitationData, error: validationError } = await supabase
    .from('class_invitations')
    .select('classroom_id, classroom:classrooms(name)')
    .eq('invitation_token', invitationCode)
    .eq('status', 'pending')
    .maybeSingle();
  
  if (validationError) {
    console.error('Invitation validation error:', validationError);
    throw new Error("Failed to validate invitation code");
  }
  
  if (!invitationData) {
    console.log('Invalid or expired invitation code');
    throw new Error("The invitation code is invalid or has expired");
  }

  console.log('Invitation validated:', invitationData);
  
  // Get or create student record
  console.log('Getting student ID for user:', session.user.id);
  let studentId;
  const { data: studentData, error: studentError } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (studentError) {
    console.error('Error fetching student record:', studentError);
  }

  if (!studentData) {
    console.log('Creating new student record for user');
    const username = session.user.email?.split('@')[0] || 'Student';
    const { data: newStudent, error: createError } = await supabase
      .from('students')
      .insert({
        user_id: session.user.id,
        name: username,
        school: '',
        points: 0
      })
      .select('id')
      .single();
      
    if (createError || !newStudent) {
      console.error('Error creating student profile:', createError);
      throw new Error("Could not create student profile");
    }
    
    studentId = newStudent.id;
    
    // Ensure user role is set to student
    console.log('Ensuring user role is set to student');
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();
      
    if (!existingRole) {
      await supabase
        .from('user_roles')
        .insert({
          user_id: session.user.id,
          role: 'student'
        });
    }
  } else {
    studentId = studentData.id;
  }

  console.log('Student ID:', studentId);
  console.log('Checking if already enrolled in classroom:', invitationData.classroom_id);
  
  // Check if already enrolled
  const { data: existingEnrollment, error: enrollmentCheckError } = await supabase
    .from('classroom_students')
    .select('id')
    .match({
      classroom_id: invitationData.classroom_id,
      student_id: studentId
    })
    .maybeSingle();

  if (enrollmentCheckError) {
    console.error('Error checking enrollment:', enrollmentCheckError);
  }

  if (existingEnrollment) {
    console.log('Student already enrolled in this classroom');
    toast({
      variant: "default",
      title: "Already Enrolled",
      description: "You are already enrolled in this class"
    });
    throw new Error("Already enrolled");
  }

  console.log('Enrolling student in classroom');
  // Enroll student in classroom
  const { error: enrollError } = await supabase
    .from('classroom_students')
    .insert({
      classroom_id: invitationData.classroom_id,
      student_id: studentId
    });

  if (enrollError) {
    console.error('Error enrolling in classroom:', enrollError);
    throw new Error("Failed to enroll in the classroom");
  }

  console.log('Updating invitation status to accepted');
  // Update invitation status
  await supabase
    .from('class_invitations')
    .update({ status: 'accepted' })
    .eq('invitation_token', invitationCode);

  console.log('Enrollment successful');
  toast({
    title: "Success",
    description: `You have successfully joined ${invitationData.classroom?.name || 'the class'}`
  });
  
  return true;
};
