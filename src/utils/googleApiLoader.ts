/**
 * Helper utility to dynamically load the Google API script
 */

// Track if the Google API script is loaded
let gapiScriptLoaded = false;

/**
 * Load the Google API script if it hasn't been loaded already
 */
export const loadGoogleApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If the script is already loaded, resolve immediately
    if (window.gapi) {
      console.log("Google API script already loaded");
      gapiScriptLoaded = true;
      resolve();
      return;
    }

    // If we're already in the process of loading, check periodically
    if (gapiScriptLoaded) {
      const checkGapiInterval = setInterval(() => {
        if (window.gapi) {
          clearInterval(checkGapiInterval);
          resolve();
        }
      }, 100);
      
      // Set a timeout to avoid infinite checking
      setTimeout(() => {
        clearInterval(checkGapiInterval);
        reject(new Error("Google API script loading timed out"));
      }, 10000);
      
      return;
    }

    // Otherwise, load the script
    gapiScriptLoaded = true;
    console.log("Loading Google API script...");
    
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("Google API script loaded successfully");
      resolve();
    };
    
    script.onerror = () => {
      console.error("Failed to load Google API script");
      gapiScriptLoaded = false;
      reject(new Error("Failed to load Google API script"));
    };
    
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
