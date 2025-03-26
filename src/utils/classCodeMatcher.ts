
/**
 * Utility functions for matching class codes in different ways
 */

// Find classroom by prefix (first few characters of ID)
export function findClassroomByPrefix(classrooms: any[], code: string): any | null {
  if (!classrooms?.length || !code) return null;
  
  // Find classroom where ID starts with the given code
  return classrooms.find(c => 
    c.id.toLowerCase().startsWith(code.toLowerCase())
  ) || null;
}

// Find classroom by case insensitive match
export function findClassroomByCaseInsensitive(classrooms: any[], code: string): any | null {
  if (!classrooms?.length || !code) return null;
  
  // Find matching classroom through case-insensitive comparison
  return classrooms.find(c => 
    c.id.toLowerCase() === code.toLowerCase() ||
    c.id.toLowerCase().includes(code.toLowerCase())
  ) || null;
}

export const classCodeMatcher = {
  findClassroomByPrefix,
  findClassroomByCaseInsensitive
};
