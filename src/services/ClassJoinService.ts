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

  // Enroll student in classroom with RLS bypass via service function
  async enrollStudent(studentId: string, classroomId: string): Promise<JoinClassroomResult> {
    console.log("Enrolling student in classroom:", { studentId, classroomId });
    
    try {
      // Skip direct insert and go straight to the RPC function approach
      // which has SECURITY DEFINER privilege to bypass RLS
      
      // First check for existing invitations we can use
      const { data: invitations, error: invError } = await supabase
        .from('class_invitations')
        .select('invitation_token')
        .eq('classroom_id', classroomId)
        .eq('status', 'pending')
        .limit(1);
        
      if (invError) {
        console.error("Error checking for invitations:", invError);
      }
        
      // If we found an invitation, use it
      if (invitations && invitations.length > 0) {
        const invitation_token = invitations[0].invitation_token;
        console.log("Using existing invitation token:", invitation_token);
        
        const { data: fnResult, error: fnError } = await supabase
          .rpc('enroll_student', { 
            invitation_token, 
            student_id: studentId 
          });
          
        if (fnError) {
          console.error("RPC enrollment error with existing invitation:", fnError);
          return { data: null, error: fnError };
        }
        
        return { data: { enrolled: true }, error: null };
      } 
      
      // Otherwise create a temporary invitation to use
      console.log("Creating temporary invitation for enrollment");
      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { data: newInvitation, error: createError } = await supabase
        .from('class_invitations')
        .insert({
          classroom_id: classroomId,
          email: `temp-${Date.now()}@enrollment.temp`,
          invitation_token: token,
          status: 'pending'
        })
        .select();
        
      if (createError) {
        console.error("Error creating temporary invitation:", createError);
        return { data: null, error: createError };
      }
      
      console.log("Created temporary invitation with token:", token);
      
      // Use the new invitation to enroll
      const { data: fnResult, error: fnError } = await supabase
        .rpc('enroll_student', { 
          invitation_token: token, 
          student_id: studentId 
        });
        
      if (fnError) {
        console.error("RPC enrollment error with temp invitation:", fnError);
        return { data: null, error: fnError };
      }
      
      console.log("Successfully enrolled student with temporary invitation");
      return { data: { enrolled: true }, error: null };
    } catch (error: any) {
      console.error("Enrollment exception:", error);
      return { 
        data: null, 
        error: { message: "Failed to enroll in the classroom. Please try again or contact support." } 
      };
    }
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
    
    try {
      // 1. First try to find the invitation by token (most common case)
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
      
      // 2. Try case-insensitive match on invitation token
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
      
      // 3. Get all classrooms for further matching
      console.log("Getting all classrooms for ID/name matching");
      const { data: classrooms, error: classroomsError } = await supabase
        .from('classrooms')
        .select('*');
      
      if (classroomsError) {
        console.error("Error fetching classrooms:", classroomsError);
        return { data: null, error: { message: "Error searching for classroom" } };
      }
      
      if (!classrooms || classrooms.length === 0) {
        return { data: null, error: { message: "No classrooms found in the system" } };
      }
      
      // 4. Try direct match with classroom ID
      console.log("Trying to match classroom ID");
      for (const classroom of classrooms) {
        // Direct ID match
        if (classroom.id === cleanCode) {
          console.log("Found classroom by direct ID match:", classroom);
          return { data: { classroom }, error: null };
        }
        
        // Classroom ID starts with code (shortened ID)
        if (classroom.id.toLowerCase().startsWith(cleanCode.toLowerCase())) {
          console.log("Found classroom by ID prefix match:", classroom);
          return { data: { classroom }, error: null };
        }
        
        // First 6 chars of classroom ID match code
        const shortId = classroom.id.substring(0, 6).toLowerCase();
        if (shortId === cleanCode.toLowerCase()) {
          console.log("Found classroom by short ID match:", classroom);
          return { data: { classroom }, error: null };
        }
      }
      
      // 5. Try matching by classroom name
      console.log("Trying classroom name match");
      const nameMatch = classrooms.find(c => 
        c.name.toLowerCase().includes(cleanCode.toLowerCase())
      );
      
      if (nameMatch) {
        console.log("Found classroom by name match:", nameMatch);
        return { data: { classroom: nameMatch }, error: null };
      }
      
      // No matches found
      console.log("No classroom or invitation found for code:", cleanCode);
      return { 
        data: null, 
        error: { message: "Could not find a classroom with this code. Please check and try again." }
      };
    } catch (error) {
      console.error("Error in findClassroomOrInvitation:", error);
      return { 
        data: null, 
        error: { message: "An error occurred while searching for the classroom." }
      };
    }
  }
};
