
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

  // Get exact invitation match
  async getExactInvitation(invitationCode: string): Promise<JoinClassroomResult> {
    const { data, error } = await supabase
      .from('class_invitations')
      .select('*, classroom:classrooms(*)')
      .eq('invitation_token', invitationCode)
      .eq('status', 'pending')
      .maybeSingle();
      
    return { data, error };
  },

  // Get case-insensitive invitation match
  async getCaseInsensitiveInvitation(invitationCode: string): Promise<JoinClassroomResult> {
    const { data, error } = await supabase
      .from('class_invitations')
      .select('*, classroom:classrooms(*)')
      .ilike('invitation_token', invitationCode)
      .eq('status', 'pending')
      .maybeSingle();
      
    return { data, error };
  },

  // Get classroom by exact ID
  async getClassroomByExactId(classroomId: string): Promise<JoinClassroomResult> {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', classroomId)
      .maybeSingle();
      
    return { data, error };
  },

  // Get all classrooms (for prefix/partial matching)
  async getAllClassrooms(): Promise<JoinClassroomResult> {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*');
      
    return { data, error };
  }
};
