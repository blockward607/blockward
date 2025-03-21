
import { EnrollmentService } from './EnrollmentService';
import { InvitationMatchingService } from './InvitationMatchingService';
import { JoinClassroomResult } from './types';

export const ClassJoinService = {
  // Check if student is already enrolled in this classroom
  checkEnrollment: EnrollmentService.checkEnrollment,
  
  // Enroll student in classroom with RLS bypass via service function
  enrollStudent: EnrollmentService.enrollStudent,
  
  // Update invitation status to accepted
  acceptInvitation: EnrollmentService.acceptInvitation,
  
  // Try all possible ways to find a classroom or invitation
  findClassroomOrInvitation: InvitationMatchingService.findClassroomOrInvitation.bind(InvitationMatchingService)
};

export type { JoinClassroomResult };
