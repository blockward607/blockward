
import React, { useState, useEffect } from "react";
import { useJoinClassContext } from "./JoinClassContext";
import { QRCodeScanner } from "../QRCodeScanner";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface QRScanTabProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export const QRScanTab: React.FC<QRScanTabProps> = ({ open, onOpenChange, onClose }) => {
  const { loading, setLoading, invitationCode, setInvitationCode } = useJoinClassContext();
  const [scanComplete, setScanComplete] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [processingCode, setProcessingCode] = useState<string | null>(null);
  const [isHandlingCode, setIsHandlingCode] = useState(false);

  // Reset state when tab opens/closes
  useEffect(() => {
    if (!open) {
      // Small delay to prevent flashing of old error messages
      const timer = setTimeout(() => {
        setScanError(null);
        setProcessingCode(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleCodeScanned = async (code: string) => {
    // Prevent duplicate scans or handling when already processing
    if (!code || scanComplete || isHandlingCode) return;
    
    console.log(`QR Code scanned: ${code}`);
    setIsHandlingCode(true);
    setScanComplete(true);
    setScanError(null);
    setProcessingCode(code);

    try {
      // Display feedback to the user
      toast.info("Code detected! Joining classroom...");
      setLoading(true);
      
      // First check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("You need to be logged in to join a class");
      }
      
      // Set the invitation code to trigger joining in the parent component
      setInvitationCode(code);
      
      // Get the student ID for this user
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (studentError || !studentData) {
        console.error("Error getting student ID:", studentError);
        throw new Error("Student profile not found. Make sure you're signed in with a student account.");
      }

      // Look for invitation by direct code match (case-insensitive)
      const { data: invitationData, error: invitationError } = await supabase
        .from("class_invitations")
        .select("id, classroom_id")
        .ilike("invitation_token", code)
        .eq("status", "pending")
        .maybeSingle();
      
      let classroomId;
      let invitationId;
      
      if (invitationData) {
        // Found invitation
        classroomId = invitationData.classroom_id;
        invitationId = invitationData.id;
        console.log("Found invitation match:", invitationData);
      } else {
        // Try matching by classroom ID directly
        const { data: classroomData, error: classroomError } = await supabase
          .from("classrooms")
          .select("id")
          .eq("id", code)
          .maybeSingle();
          
        if (classroomData) {
          classroomId = classroomData.id;
          console.log("Found classroom by ID:", classroomData);
        } else {
          throw new Error("Invalid invitation code. Please try again or enter the code manually.");
        }
      }
      
      if (!classroomId) {
        throw new Error("Could not find a valid classroom with this code");
      }
      
      // Check if already enrolled
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("classroom_students")
        .select("id")
        .eq("classroom_id", classroomId)
        .eq("student_id", studentData.id);
          
      if (enrollmentError) {
        console.error("Error checking enrollment:", enrollmentError);
      }
          
      if (enrollment && enrollment.length > 0) {
        toast.success("You are already enrolled in this classroom");
        setTimeout(() => onClose(), 1000);
        return;
      }
      
      // Enroll student
      const { error: enrollError } = await supabase
        .from("classroom_students")
        .insert({
          classroom_id: classroomId,
          student_id: studentData.id
        });
          
      if (enrollError) {
        throw new Error("Error joining classroom: " + enrollError.message);
      }
        
      // If we had an invitation ID, mark it as accepted
      if (invitationId) {
        await supabase
          .from("class_invitations")
          .update({ status: "accepted" })
          .eq("id", invitationId);
      }
      
      toast.success("Successfully joined classroom!");
      
      // Refresh the classroom list to show the newly joined class
      setTimeout(() => {
        window.location.reload(); // Force refresh to update the class list
      }, 1000);
    } catch (error: any) {
      console.error("Error joining class after QR scan:", error);
      setScanError(error.message || "Failed to join the class. Please try again.");
      toast.error("Failed to join classroom. Please try again.");
      
      // Reset scan state after a delay to allow for another attempt
      setTimeout(() => {
        setScanComplete(false);
        setScanError(null);
        setProcessingCode(null);
        setIsHandlingCode(false);
      }, 3000);
    } finally {
      setLoading(false);
      
      // In case we don't hit the setTimeout above (e.g. if component unmounts)
      // Make sure to eventually reset the handling state
      if (isHandlingCode) {
        setTimeout(() => {
          setIsHandlingCode(false);
        }, 5000);
      }
    }
  };

  // If the scanner isn't open, don't render it at all
  if (!open) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-400">Camera access is disabled.</p>
      </div>
    );
  }

  if (scanComplete && loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
        <p>Joining classroom...</p>
        {processingCode && (
          <p className="text-sm text-gray-400 mt-2">Using code: {processingCode}</p>
        )}
      </div>
    );
  }

  if (scanError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400 mb-4">{scanError}</p>
        {processingCode && (
          <p className="text-sm text-gray-400 mt-2">Attempted with code: {processingCode}</p>
        )}
        <p className="text-sm text-gray-300 mt-2">
          Retrying scan in a moment...
        </p>
      </div>
    );
  }

  return (
    <div className="p-1">
      <QRCodeScanner onScan={handleCodeScanned} onClose={onClose} />
    </div>
  );
};
