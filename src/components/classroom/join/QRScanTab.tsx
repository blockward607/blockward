import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useJoinClassContext } from "./JoinClassContext";
import { QRCodeScanner } from "../QRCodeScanner";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface QRScanTabProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export const QRScanTab: React.FC<QRScanTabProps> = ({ open, onOpenChange, onClose }) => {
  const { loading, setLoading, setInvitationCode, joinClassWithCode } = useJoinClassContext();
  const [scanComplete, setScanComplete] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [processingCode, setProcessingCode] = useState<string | null>(null);
  const [isHandlingCode, setIsHandlingCode] = useState(false);
  const navigate = useNavigate();

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
      
      // Set the invitation code
      setInvitationCode(code);
      
      // Use the joinClassWithCode function from context
      await joinClassWithCode(code);
      
    } catch (error: any) {
      console.error("Error joining class after QR scan:", error);
      setScanError(error.message || "Failed to join the class. Please try again.");
      toast.error("Failed to join classroom. Please try again.");
      
      // Redirect back to classes page after error
      setTimeout(() => {
        navigate('/classes');
      }, 3000);
      
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
