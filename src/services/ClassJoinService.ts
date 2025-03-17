
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

  // Try all possible invitation matches
  async findInvitation(invitationCode: string): Promise<JoinClassroomResult> {
    console.log("Looking for invitation with code:", invitationCode);
    
    // First try exact match
    const { data: exactMatch, error: exactError } = await supabase
      .from('class_invitations')
      .select('*, classroom:classrooms(*)')
      .eq('invitation_token', invitationCode)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (exactMatch) {
      console.log("Found exact invitation match:", exactMatch);
      return { data: exactMatch, error: null };
    }
    
    // Then try case-insensitive match
    const { data: caseMatch, error: caseError } = await supabase
      .from('class_invitations')
      .select('*, classroom:classrooms(*)')
      .ilike('invitation_token', invitationCode)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (caseMatch) {
      console.log("Found case-insensitive invitation match:", caseMatch);
      return { data: caseMatch, error: null };
    }
    
    // If no invitation matches, try direct classroom ID match
    const { data: classroom, error: classroomError } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', invitationCode)
      .maybeSingle();
    
    if (classroom) {
      console.log("Found direct classroom match:", classroom);
      return { data: { classroom }, error: null };
    }
    
    // Try prefix match as last resort
    const { data: allClassrooms, error: allError } = await supabase
      .from('classrooms')
      .select('*');
    
    if (allClassrooms && allClassrooms.length > 0) {
      for (const c of allClassrooms) {
        if (c.id.toLowerCase().startsWith(invitationCode.toLowerCase()) ||
            c.id.toLowerCase().includes(invitationCode.toLowerCase())) {
          console.log("Found classroom by ID prefix/contains:", c);
          return { data: { classroom: c }, error: null };
        }
      }
    }

    console.log("No invitation or classroom match found for:", invitationCode);
    return { data: null, error: { message: "Invalid invitation code" } };
  },

  // Get invitation by direct ID
  async getInvitationById(invitationId: string): Promise<JoinClassroomResult> {
    const { data, error } = await supabase
      .from('class_invitations')
      .select('*, classroom:classrooms(*)')
      .eq('id', invitationId)
      .maybeSingle();
      
    return { data, error };
  }
};
