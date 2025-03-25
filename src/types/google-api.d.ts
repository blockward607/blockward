
interface Window {
  gapi: {
    load: (library: string, callback: () => void) => void;
    client: {
      init: (config: {
        apiKey: string;
        clientId: string;
        discoveryDocs: string[];
        scope: string;
      }) => Promise<void>;
      classroom: {
        courses: {
          list: (params?: any) => Promise<{
            result: {
              courses: any[];
              nextPageToken?: string;
            };
          }>;
          students: {
            list: (params: {
              courseId: string;
              pageSize?: number;
              pageToken?: string;
            }) => Promise<{
              result: {
                students: any[];
                nextPageToken?: string;
              };
            }>;
          };
        };
      };
    };
    auth2: {
      getAuthInstance: () => {
        signIn: (options?: { prompt: string }) => Promise<any>;
        signOut: () => Promise<void>;
        isSignedIn: {
          get: () => boolean;
          listen: (callback: (isSignedIn: boolean) => void) => void;
        };
        currentUser: {
          get: () => {
            getBasicProfile: () => {
              getName: () => string;
              getEmail: () => string;
              getImageUrl: () => string;
              getId: () => string;
            };
          };
        };
      };
      init: (params: any) => Promise<any>;
    };
  };
}
