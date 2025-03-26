
/**
 * Service for interacting with Google Classroom API
 * 
 * This file is maintained for backward compatibility.
 * New code should import from `@/services/google-classroom` instead.
 */
import GoogleClassroomService, { GoogleClassroom } from './google-classroom';

// Re-export everything from the new module
export { GoogleClassroom };
export default GoogleClassroomService;
