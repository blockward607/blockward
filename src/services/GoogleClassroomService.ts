
/**
 * Service for interacting with Google Classroom API
 * 
 * This file is maintained for backward compatibility.
 * New code should import from `@/services/google-classroom` instead.
 */
import GoogleClassroomService from './google-classroom';
import type { GoogleClassroom, GoogleClassroomStudent } from './google-classroom';

// Re-export types for backward compatibility
export type { GoogleClassroom, GoogleClassroomStudent };
export default GoogleClassroomService;
