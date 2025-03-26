
/**
 * Utility function to load the Google API script
 */
export const loadGoogleApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if API is already loaded
    if (window.gapi) {
      console.log("Google API already loaded");
      resolve();
      return;
    }

    console.log("Loading Google API script...");
    
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    
    // Set up callbacks
    script.onload = () => {
      console.log("Google API script loaded successfully");
      resolve();
    };
    
    script.onerror = (error) => {
      console.error("Failed to load Google API script:", error);
      reject(new Error('Failed to load Google API script'));
    };
    
    // Add to document
    document.head.appendChild(script);
  });
};

/**
 * Helper function to check if Google API is initialized
 */
export const isGoogleApiLoaded = (): boolean => {
  return !!window.gapi;
};

/**
 * Helper function to check if Google Auth is initialized
 */
export const isGoogleAuthInitialized = (): boolean => {
  return !!(window.gapi && window.gapi.auth2);
};
