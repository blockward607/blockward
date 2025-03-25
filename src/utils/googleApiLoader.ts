
/**
 * Utility function to load the Google API script
 */
export const loadGoogleApi = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if API is already loaded
    if (window.gapi) {
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    
    // Set up callbacks
    script.onload = () => {
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google API script'));
    };
    
    // Add to document
    document.head.appendChild(script);
  });
};
