
/**
 * Main Google Classroom service that integrates the API client and course service
 */
import apiClient from "./api-client";
import courseService from "./course-service";
import { GoogleClassroom, GoogleClassroomStudent } from "./types";

class GoogleClassroomService {
  private static instance: GoogleClassroomService;
  
  private constructor() {}

  public static getInstance(): GoogleClassroomService {
    if (!GoogleClassroomService.instance) {
      GoogleClassroomService.instance = new GoogleClassroomService();
    }
    return GoogleClassroomService.instance;
  }

  /**
   * Initialize the Google Classroom API
   */
  public async initialize(clientId: string): Promise<boolean> {
    return apiClient.initialize(clientId);
  }

  /**
   * Sign in to Google
   */
  public async signIn(): Promise<boolean> {
    return apiClient.signIn();
  }

  /**
   * Sign out from Google
   */
  public async signOut(): Promise<void> {
    return apiClient.signOut();
  }

  /**
   * Check if user is signed in
   */
  public isSignedIn(): boolean {
    return apiClient.isSignedIn();
  }

  /**
   * List Google Classroom courses
   */
  public async listCourses(): Promise<GoogleClassroom[]> {
    return courseService.listCourses();
  }

  /**
   * List students in a Google Classroom course
   */
  public async listStudents(courseId: string): Promise<GoogleClassroomStudent[]> {
    return courseService.listStudents(courseId);
  }
}

// Export the singleton instance and types
export { GoogleClassroom, GoogleClassroomStudent };
export default GoogleClassroomService.getInstance();
