
/**
 * Configuration constants for Google Classroom API
 */

// Google API discovery documents
export const DISCOVERY_DOCS = ["https://classroom.googleapis.com/$discovery/rest?version=v1"];

// Required OAuth scopes for Google Classroom API
export const SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
  "https://www.googleapis.com/auth/classroom.profile.photos"
];
