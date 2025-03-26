
/**
 * Types for Google Classroom integration
 */

// Google Classroom course type
export interface GoogleClassroom {
  id: string;
  name: string;
  section?: string;
  description?: string;
  ownerId: string;
  creationTime?: string;
  courseState?: string;
  enrollmentCode?: string;
}

// Google Classroom student type
export interface GoogleClassroomStudent {
  userId: string;
  profile: {
    id: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    emailAddress?: string;
    photoUrl?: string;
  };
}
