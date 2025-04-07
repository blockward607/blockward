
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
        throw new Error(studentError?.message || "Student profile not found");
      }
      
      // Direct lookup of invitation code
      const { data: invitationData, error: invitationError } = await supabase
        .from("class_invitations")
        .select("id, classroom_id")
        .eq("invitation_token", code)
        .eq("status", "pending")
        .single();
        
      if (invitationError) {
        console.log("Direct invitation lookup failed, trying secondary matching");
        // If direct lookup fails, try matching with classroom ID
        const { data: classroomData, error: classroomError } = await supabase
          .from("classrooms")
          .select("id")
          .eq("id", code)
          .single();
          
        if (classroomError) {
          throw new Error("Invalid invitation code");
        }
        
        // We found the classroom directly by ID
        const classroomId = classroomData.id;
        
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
        
        // Use direct database insert (bypassing RLS with function)
        const { data: insertData, error: insertError } = await supabase.rpc(
          'enroll_student',
          { 
            invitation_token: code,
            student_id: studentData.id
          }
        );
        
        if (insertError) {
          // Fallback to direct insert
          const { error: directInsertError } = await supabase
            .from("classroom_students")
            .insert({
              classroom_id: classroomId,
              student_id: studentData.id
            });
            
          if (directInsertError) {
            throw new Error("Error joining classroom: " + directInsertError.message);
          }
        }
      } else {
        // We found a valid invitation
        const classroomId = invitationData.classroom_id;
        
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
        
        // Use RPC function to handle enrollment
        const { error: enrollError } = await supabase.rpc(
          'enroll_student',
          { 
            invitation_token: code,
            student_id: studentData.id
          }
        );
        
        if (enrollError) {
          // Fallback to direct insert
          const { error: directInsertError } = await supabase
            .from("classroom_students")
            .insert({
              classroom_id: classroomId,
              student_id: studentData.id
            });
            
          if (directInsertError) {
            throw new Error("Error joining classroom: " + directInsertError.message);
          }
          
          // Mark invitation as accepted
          await supabase
            .from("class_invitations")
            .update({ status: "accepted" })
            .eq("id", invitationData.id);
        }
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
