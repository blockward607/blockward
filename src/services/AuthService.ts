
import { UserRoleService } from './UserRoleService';
import { WalletService } from './WalletService';
import { ProfileService } from './ProfileService';
import { ClassroomService } from './ClassroomService';
import { InvitationService } from './InvitationService';

// Re-export all services as a unified API
export const AuthService = {
  // User role operations
  checkUserRole: UserRoleService.checkUserRole,
  createUserRole: UserRoleService.createUserRole,
  
  // Wallet operations
  checkUserWallet: WalletService.checkUserWallet,
  createUserWallet: WalletService.createUserWallet,
  
  // Profile operations
  checkTeacherProfile: ProfileService.checkTeacherProfile,
  createTeacherProfile: ProfileService.createTeacherProfile,
  checkStudentProfile: ProfileService.checkStudentProfile,
  createStudentProfile: ProfileService.createStudentProfile,
  
  // Classroom operations
  generateClassCode: ClassroomService.generateClassCode,
  getTeacherStudents: ClassroomService.getTeacherStudents,
  
  // Invitation operations
  validateInvitationCode: InvitationService.validateInvitationCode,
  enrollStudentInClassroom: InvitationService.enrollStudentInClassroom,
  createClassInvitation: InvitationService.createClassInvitation,
  sendEmailInvitation: InvitationService.sendEmailInvitation
};
