
/**
 * Service for interacting with Google Classroom API
 */
import { toast } from "sonner";
import { loadGoogleApi } from "@/utils/googleApiLoader";

// Google API configuration
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
  enrollmentCode?: string;
}

export class GoogleClassroomService {
  private static instance: GoogleClassroomService;
  private isInitialized = false;
  private isLoading = false;
  private clientId = "";

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

    if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID") {
      console.error("Google Client ID not provided or invalid");
      toast.error("Google Classroom integration requires a valid client ID");
      return false;
    }

    this.clientId = clientId;
    this.isLoading = true;

    try {
      console.log("Initializing Google API...");
      
      // Ensure the Google API script is loaded
      await loadGoogleApi();
      
      if (!window.gapi) {
        throw new Error("Google API not loaded");
      }

      // Load the client auth2 library
      await new Promise<void>((resolve, reject) => {
        console.log("Loading client:auth2...");
        window.gapi.load("client:auth2", {
          callback: () => resolve(),
          onerror: (error: any) => reject(new Error(`Failed to load client:auth2: ${error}`))
        });
      });

      // Initialize the client
      console.log("Initializing Google API client...");
      await window.gapi.client.init({
        clientId: this.clientId,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES.join(" ")
      });

      console.log("Google API client initialized successfully");
      this.isInitialized = true;
      this.isLoading = false;
      return true;
    } catch (error) {
      console.error("Error initializing Google API:", error);
      toast.error("Failed to initialize Google Classroom");
      this.isLoading = false;
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Sign in the user to Google and request permissions
   */
  public async signIn(): Promise<boolean> {
    if (!window.gapi || !window.gapi.auth2) {
      console.error("Google Auth API not loaded, attempting to initialize");
      const initialized = await this.initialize(this.clientId);
      if (!initialized) {
        return false;
      }
    }

    try {
      console.log("Attempting to sign in with Google...");
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn({
        prompt: "select_account"
      });
      const isSignedIn = authInstance.isSignedIn.get();
      console.log("Google sign in result:", isSignedIn);
      return isSignedIn;
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
    if (!window.gapi || !window.gapi.auth2) {
      console.warn("Google Auth API not loaded, nothing to sign out from");
      return;
    }

    try {
      console.log("Signing out from Google...");
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      console.log("Signed out from Google");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  /**
   * Check if the user is signed in
   */
  public isSignedIn(): boolean {
    if (!window.gapi || !window.gapi.auth2) {
      return false;
    }
    
    try {
      return window.gapi.auth2.getAuthInstance().isSignedIn.get();
    } catch (error) {
      console.error("Error checking if signed in:", error);
      return false;
    }
  }

  /**
   * Get a list of the user's Google Classroom courses
   */
  public async listCourses(): Promise<GoogleClassroom[]> {
    if (!window.gapi || !window.gapi.client || !window.gapi.client.classroom) {
      console.error("Google Classroom API not initialized");
      return [];
    }

    if (!this.isSignedIn()) {
      console.error("User not signed in to Google");
      return [];
    }

    try {
      console.log("Fetching Google Classroom courses...");
      const response = await window.gapi.client.classroom.courses.list({
        pageSize: 20,
        courseStates: ["ACTIVE"]
      });

      if (response.result.courses && response.result.courses.length > 0) {
        console.log(`Found ${response.result.courses.length} courses`);
        return response.result.courses.map(course => ({
          id: course.id,
          name: course.name,
          section: course.section,
          description: course.description,
          ownerId: course.ownerId,
          creationTime: course.creationTime,
          courseState: course.courseState,
          enrollmentCode: course.enrollmentCode
        }));
      }
      
      console.log("No courses found");
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
    if (!window.gapi || !window.gapi.client || !window.gapi.client.classroom) {
      console.error("Google Classroom API not initialized");
      return [];
    }

    if (!this.isSignedIn()) {
      console.error("User not signed in to Google");
      return [];
    }

    try {
      console.log(`Fetching students for course ${courseId}...`);
      const response = await window.gapi.client.classroom.courses.students.list({
        courseId: courseId,
        pageSize: 100
      });

      const students = response.result.students || [];
      console.log(`Found ${students.length} students for course ${courseId}`);
      return students;
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students from Google Classroom");
      return [];
    }
  }
}

export default GoogleClassroomService.getInstance();
