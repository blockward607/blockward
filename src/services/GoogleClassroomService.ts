
/**
 * Service for interacting with Google Classroom API
 */
import { toast } from "sonner";

// Google API configuration
const API_KEY = ""; // This will be populated from environment
const DISCOVERY_DOCS = ["https://classroom.googleapis.com/$discovery/rest?version=v1"];
const SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
  "https://www.googleapis.com/auth/classroom.profile.photos"
];

export interface GoogleClassroom {
  id: string;
  name: string;
  section?: string;
  description?: string;
  ownerId: string;
  creationTime?: string;
  courseState?: string;
}

export class GoogleClassroomService {
  private static instance: GoogleClassroomService;
  private isInitialized = false;
  private isLoading = false;

  private constructor() {}

  public static getInstance(): GoogleClassroomService {
    if (!GoogleClassroomService.instance) {
      GoogleClassroomService.instance = new GoogleClassroomService();
    }
    return GoogleClassroomService.instance;
  }

  /**
   * Load the Google API client and authenticate the user
   */
  public async initialize(clientId: string): Promise<boolean> {
    if (this.isInitialized) return true;
    if (this.isLoading) return false;

    this.isLoading = true;

    try {
      // Wait for gapi to load
      if (!window.gapi) {
        console.error("Google API not loaded");
        toast.error("Failed to load Google API");
        this.isLoading = false;
        return false;
      }

      // Load the client auth2 library
      await new Promise<void>((resolve) => {
        window.gapi.load("client:auth2", resolve);
      });

      // Initialize the client
      await window.gapi.client.init({
        apiKey: API_KEY,
        clientId,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES.join(" ")
      });

      this.isInitialized = true;
      this.isLoading = false;
      return true;
    } catch (error) {
      console.error("Error initializing Google API:", error);
      toast.error("Failed to initialize Google Classroom");
      this.isLoading = false;
      return false;
    }
  }

  /**
   * Sign in the user to Google and request permissions
   */
  public async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      console.error("Google API not initialized");
      return false;
    }

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn({
        prompt: "select_account"
      });
      return authInstance.isSignedIn.get();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Failed to sign in with Google");
      return false;
    }
  }

  /**
   * Sign out the user from Google
   */
  public async signOut(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  /**
   * Check if the user is signed in
   */
  public isSignedIn(): boolean {
    if (!this.isInitialized) return false;
    
    try {
      return window.gapi.auth2.getAuthInstance().isSignedIn.get();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get a list of the user's Google Classroom courses
   */
  public async listCourses(): Promise<GoogleClassroom[]> {
    if (!this.isInitialized || !this.isSignedIn()) {
      console.error("Google API not initialized or user not signed in");
      return [];
    }

    try {
      const response = await window.gapi.client.classroom.courses.list({
        pageSize: 20,
        courseStates: ["ACTIVE"]
      });

      if (response.result.courses && response.result.courses.length > 0) {
        return response.result.courses.map(course => ({
          id: course.id,
          name: course.name,
          section: course.section,
          description: course.description,
          ownerId: course.ownerId,
          creationTime: course.creationTime,
          courseState: course.courseState
        }));
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch Google Classroom courses");
      return [];
    }
  }

  /**
   * Get students for a specific course
   */
  public async listStudents(courseId: string): Promise<any[]> {
    if (!this.isInitialized || !this.isSignedIn()) {
      console.error("Google API not initialized or user not signed in");
      return [];
    }

    try {
      const response = await window.gapi.client.classroom.courses.students.list({
        courseId: courseId,
        pageSize: 100
      });

      return response.result.students || [];
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students from Google Classroom");
      return [];
    }
  }
}

export default GoogleClassroomService.getInstance();
