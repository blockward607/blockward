
/**
 * Client for interacting with Google API
 */
import { toast } from "sonner";
import { loadGoogleApi } from "@/utils/googleApiLoader";
import { DISCOVERY_DOCS, SCOPES } from "./config";

class GoogleApiClient {
  private isInitialized = false;
  private isLoading = false;
  private clientId = "";

  /**
   * Initialize the Google API client with the provided client ID
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
      await new Promise<void>((resolve) => {
        console.log("Loading client:auth2...");
        window.gapi.load("client:auth2", () => {
          console.log("client:auth2 loaded successfully");
          resolve();
        });
      });

      // Initialize the client with your Google Cloud project
      console.log("Initializing Google API client with client ID:", this.clientId);
      try {
        await window.gapi.client.init({
          apiKey: null, // Not required for OAuth flows
          clientId: this.clientId,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES.join(" ")
        });
        console.log("Google API client initialized successfully");
      } catch (initError) {
        console.error("Error in gapi.client.init:", initError);
        throw initError;
      }

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
      console.error("Google Auth API not loaded");
      return false;
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
}

// Export singleton instance
export default new GoogleApiClient();
