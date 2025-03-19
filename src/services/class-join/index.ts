
import { EnrollmentService } from './EnrollmentService';
import { InvitationMatchingService } from './InvitationMatchingService';
import { JoinClassroomResult } from './types';

export const ClassJoinService = {
  // Validate classroom by ID
  validateClassroom: EnrollmentService.validateClassroom,
  
  // Validate student by ID
  validateStudent: EnrollmentService.validateStudent,
  
  // Enroll student in classroom with invitation token
  enrollStudentInClassroom: EnrollmentService.enrollStudentInClassroom,
  
  // Try all possible ways to find a classroom or invitation
  findClassroomOrInvitation: InvitationMatchingService.findClassroomOrInvitation
};

export type { JoinClassroomResult };
