
// This file has been removed as part of Google Classroom feature removal
export const useGoogleClassroom = () => {
  return {
    googleClassrooms: [],
    loading: false,
    isAuthenticated: false,
    authenticateWithGoogle: async () => false,
    fetchGoogleClassrooms: async () => [],
    checkGoogleClassroomCode: async () => null
  };
};
