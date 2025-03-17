
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

  // Find classroom directly by ID
  async findClassroomById(classroomId: string): Promise<JoinClassroomResult> {
    console.log("Looking for classroom with ID:", classroomId);
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', classroomId)
      .maybeSingle();
    
    return { data, error };
  },

  // Find active invitation by token
  async findInvitationByToken(invitationToken: string): Promise<JoinClassroomResult> {
    console.log("Looking for invitation with token:", invitationToken);
    
    // Try exact match first
    const { data: exactMatch, error: exactError } = await supabase
      .from('class_invitations')
      .select('*, classroom:classrooms(*)')
      .eq('invitation_token', invitationToken)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (exactMatch) {
      console.log("Found exact invitation match:", exactMatch);
      return { data: exactMatch, error: null };
    }
    
    // Try case-insensitive match
    const { data: caseMatch, error: caseError } = await supabase
      .from('class_invitations')
      .select('*, classroom:classrooms(*)')
      .ilike('invitation_token', invitationToken)
      .eq('status', 'pending')
      .maybeSingle();
    
    if (caseMatch) {
      console.log("Found case-insensitive invitation match:", caseMatch);
      return { data: caseMatch, error: null };
    }
    
    return { data: null, error: { message: "No matching invitation found" } };
  },

  // Try all possible ways to find a classroom or invitation
  async findClassroomOrInvitation(code: string): Promise<JoinClassroomResult> {
    // Clean and normalize the code
    const cleanCode = code.trim();
    
    if (!cleanCode) {
      return { data: null, error: { message: "Please enter a valid code" } };
    }
    
    console.log("Attempting to find classroom or invitation with code:", cleanCode);
    
    // 1. Try to find invitation by token (exact or case-insensitive)
    const invitationResult = await this.findInvitationByToken(cleanCode);
    if (invitationResult.data) {
      return invitationResult;
    }
    
    // 2. Try to find classroom by ID (direct match)
    const classroomResult = await this.findClassroomById(cleanCode);
    if (classroomResult.data) {
      return { 
        data: { classroom: classroomResult.data }, 
        error: null 
      };
    }
    
    // 3. Get all classrooms and try fuzzy matching
    const { data: allClassrooms, error: allError } = await supabase
      .from('classrooms')
      .select('*');
    
    if (allClassrooms?.length) {
      // Try to find by prefix
      const prefixMatch = allClassrooms.find(c => 
        c.id.toLowerCase().startsWith(cleanCode.toLowerCase())
      );
      
      if (prefixMatch) {
        console.log("Found classroom by ID prefix:", prefixMatch);
        return { data: { classroom: prefixMatch }, error: null };
      }
      
      // Try to find by substring
      const substringMatch = allClassrooms.find(c => 
        c.id.toLowerCase().includes(cleanCode.toLowerCase())
      );
      
      if (substringMatch) {
        console.log("Found classroom by ID substring:", substringMatch);
        return { data: { classroom: substringMatch }, error: null };
      }
    }
    
    // No matches found
    console.log("No classroom or invitation found for code:", cleanCode);
    return { 
      data: null, 
      error: { message: "Invalid classroom code. Please check and try again." }
    };
  }
};
