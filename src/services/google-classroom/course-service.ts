
/**
 * Service for fetching course and student data from Google Classroom
 */
import { toast } from "sonner";
import apiClient from "./api-client";
import { GoogleClassroom, GoogleClassroomStudent } from "./types";

class GoogleClassroomCourseService {
  /**
   * Get a list of the user's Google Classroom courses
   */
  public async listCourses(): Promise<GoogleClassroom[]> {
    if (!window.gapi || !window.gapi.client || !window.gapi.client.classroom) {
      console.error("Google Classroom API not initialized");
      return [];
    }

    if (!apiClient.isSignedIn()) {
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
  public async listStudents(courseId: string): Promise<GoogleClassroomStudent[]> {
    if (!window.gapi || !window.gapi.client || !window.gapi.client.classroom) {
      console.error("Google Classroom API not initialized");
      return [];
    }

    if (!apiClient.isSignedIn()) {
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

// Export singleton instance
export default new GoogleClassroomCourseService();
