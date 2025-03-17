
import { supabase } from "@/integrations/supabase/client";

export interface JoinClassroomResult {
  data: any;
  error: any;
}

export const ClassJoinService = {
  // Check if student is already enrolled in this classroom
  async checkEnrollment(studentId: string, classroomId: string): Promise<JoinClassroomResult> {
    console.log("Checking if already enrolled in classroom:", classroomId);
    const { data, error } = await supabase
      .from('classroom_students')
      .select('*')
      .eq('classroom_id', classroomId)
      .eq('student_id', studentId)
      .maybeSingle();

    return { data, error };
  },

  // Enroll student in classroom
  async enrollStudent(studentId: string, classroomId: string): Promise<JoinClassroomResult> {
    console.log("Enrolling student in classroom:", { studentId, classroomId });
    const { data, error } = await supabase
      .from('classroom_students')
      .insert({
        classroom_id: classroomId,
        student_id: studentId
      })
      .select();

    return { data, error };
  },

  // Update invitation status to accepted
  async acceptInvitation(invitationId: string): Promise<JoinClassroomResult> {
    const { data, error } = await supabase
      .from('class_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationId)
      .select();
      
    return { data, error };
  },

  // Try all possible ways to find a classroom or invitation
  async findClassroomOrInvitation(code: string): Promise<JoinClassroomResult> {
    // Clean and normalize the code
    const cleanCode = code.trim();
    
    if (!cleanCode) {
      return { data: null, error: { message: "Please enter a valid code" } };
    }
    
    console.log("Attempting to find classroom or invitation with code:", cleanCode);
    
    // 1. Try direct match with classroom ID
    console.log("Trying direct classroom ID match");
    const { data: directClassroom, error: directError } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', cleanCode)
      .maybeSingle();
    
    if (directClassroom) {
      console.log("Found classroom by direct ID match:", directClassroom);
      return { data: { classroom: directClassroom }, error: null };
    }
    
    // 2. Try to find invitation token (exact match)
    console.log("Trying exact invitation token match");
    const { data: directInvitation, error: invError } = await supabase
      .from('class_invitations')
      .select('*, classroom:classrooms(*)')
      .eq('invitation_token', cleanCode)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (directInvitation) {
      console.log("Found invitation by exact token match:", directInvitation);
      return { data: directInvitation, error: null };
    }
    
    // 3. Try case-insensitive match on invitation token
    console.log("Trying case-insensitive invitation token match");
    const { data: caseInvitation } = await supabase
      .from('class_invitations')
      .select('*, classroom:classrooms(*)')
      .ilike('invitation_token', cleanCode)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (caseInvitation) {
      console.log("Found invitation by case-insensitive token match:", caseInvitation);
      return { data: caseInvitation, error: null };
    }
    
    // 4. Try using the first 6 characters as classroom ID prefix
    console.log("Trying classroom ID prefix");
    let { data: classrooms } = await supabase
      .from('classrooms')
      .select('*');
    
    if (classrooms && classrooms.length > 0) {
      // Check if any classroom ID starts with or contains our code
      for (const classroom of classrooms) {
        if (classroom.id.toLowerCase().startsWith(cleanCode.toLowerCase()) ||
            classroom.id.toLowerCase().includes(cleanCode.toLowerCase())) {
          console.log("Found classroom by ID pattern match:", classroom);
          return { data: { classroom: classroom }, error: null };
        }
      }
      
      // Check if our code is a shortened version of any classroom ID
      for (const classroom of classrooms) {
        const shortId = classroom.id.substring(0, 6).toLowerCase();
        if (shortId === cleanCode.toLowerCase()) {
          console.log("Found classroom by short ID match:", classroom);
          return { data: { classroom: classroom }, error: null };
        }
      }
    }
    
    // 5. Check for active invitations with similar tokens
    console.log("Looking for similar invitation tokens");
    const { data: invitations } = await supabase
      .from('class_invitations')
      .select('*, classroom:classrooms(*)')
      .eq('status', 'pending');
    
    if (invitations && invitations.length > 0) {
      for (const inv of invitations) {
        if (inv.invitation_token.toLowerCase().includes(cleanCode.toLowerCase()) ||
            cleanCode.toLowerCase().includes(inv.invitation_token.toLowerCase())) {
          console.log("Found invitation by token similarity:", inv);
          return { data: inv, error: null };
        }
      }
    }
    
    // 6. As a last resort, try to match by classroom name
    console.log("Trying classroom name match");
    const { data: nameMatches } = await supabase
      .from('classrooms')
      .select('*')
      .ilike('name', `%${cleanCode}%`);
    
    if (nameMatches && nameMatches.length > 0) {
      console.log("Found classroom by name match:", nameMatches[0]);
      return { data: { classroom: nameMatches[0] }, error: null };
    }
    
    // No matches found
    console.log("No classroom or invitation found for code:", cleanCode);
    return { 
      data: null, 
      error: { message: "Invalid classroom code. Please check and try again." }
    };
  }
};
