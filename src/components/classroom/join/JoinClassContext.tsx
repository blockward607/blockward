
import React, { createContext, useState, useContext, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { ClassJoinService } from "@/services/class-join";
import { supabase } from "@/integrations/supabase/client";

interface JoinClassContextType {
  joining: boolean;
  joinError: string | null;
  joinSuccess: boolean;
  joinClass: (code: string) => Promise<void>;
  resetJoinState: () => void;
}

const JoinClassContext = createContext<JoinClassContextType | undefined>(undefined);

export const JoinClassProvider = ({ children }: { children: ReactNode }) => {
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const { toast } = useToast();

  const resetJoinState = () => {
    setJoining(false);
    setJoinError(null);
    setJoinSuccess(false);
  };

  const joinClass = async (code: string) => {
    try {
      setJoining(true);
      setJoinError(null);
      setJoinSuccess(false);
      
      console.log("Attempting to join class with code:", code);
      
      // Validate session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to join a class");
      }
      
      console.log("User is authenticated, proceeding with class join");
      
      // Get student profile for the current user
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();
        
      if (studentError) {
        console.error("Error fetching student profile:", studentError);
        throw new Error("Failed to fetch your student profile");
      }
      
      if (!studentData) {
        console.error("No student profile found for user");
        throw new Error("No student profile found for your account");
      }
      
      console.log("Found student profile:", studentData);
      
      // Find classroom by code
      const { data: invitationData, error: inviteError } = await ClassJoinService.findClassroomOrInvitation(code);
      
      if (inviteError) {
        console.error("Error finding classroom:", inviteError);
        throw new Error(inviteError.message || "Failed to find classroom with this code");
      }
      
      if (!invitationData) {
        throw new Error("Invalid invitation code. Please check and try again.");
      }
      
      console.log("Found invitation data:", invitationData);
      
      // Check if classroom exists
      if (!invitationData.classroomId) {
        throw new Error("Could not find a classroom with this code");
      }
      
      // Check if already enrolled
      const { data: enrollmentCheck, error: enrollmentError } = await ClassJoinService.checkEnrollment(
        studentData.id,
        invitationData.classroomId
      );
      
      if (enrollmentError) {
        console.error("Error checking enrollment:", enrollmentError);
      }
      
      if (enrollmentCheck) {
        console.log("Already enrolled in this classroom:", enrollmentCheck);
        toast({
          title: "Already Enrolled",
          description: "You are already enrolled in this class",
        });
        setJoinSuccess(true);
        return;
      }
      
      // Enroll student in classroom
      console.log("Enrolling student in classroom:", {
        studentId: studentData.id,
        classroomId: invitationData.classroomId,
      });
      
      const { data: enrollment, error: enrollError } = await ClassJoinService.enrollStudent(
        studentData.id,
        invitationData.classroomId
      );
      
      if (enrollError) {
        console.error("Error enrolling in classroom:", enrollError);
        throw new Error(enrollError.message || "Failed to join the classroom");
      }
      
      console.log("Successfully enrolled:", enrollment);
      
      // If there was an invitation ID, mark it as accepted
      if (invitationData.invitationId) {
        await ClassJoinService.acceptInvitation(invitationData.invitationId);
      }
      
      toast({
        title: "Success!",
        description: "You have successfully joined the class",
      });
      
      setJoinSuccess(true);
    } catch (error: any) {
      console.error("Error joining class:", error);
      setJoinError(error.message || "An error occurred while joining the class");
      toast({
        title: "Error",
        description: error.message || "Failed to join class",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <JoinClassContext.Provider
      value={{
        joining,
        joinError,
        joinSuccess,
        joinClass,
        resetJoinState,
      }}
    >
      {children}
    </JoinClassContext.Provider>
  );
};

export const useJoinClass = () => {
  const context = useContext(JoinClassContext);
  if (context === undefined) {
    throw new Error("useJoinClass must be used within a JoinClassProvider");
  }
  return context;
};
