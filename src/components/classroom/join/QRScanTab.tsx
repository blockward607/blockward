
import React, { useState } from "react";
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
  const { joinClassWithCode, loading } = useJoinClassContext();
  const [scanComplete, setScanComplete] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [processingCode, setProcessingCode] = useState<string | null>(null);

  const handleCodeScanned = async (code: string) => {
    console.log(`QR Code scanned: ${code}`);
    setScanComplete(true);
    setScanError(null);
    setProcessingCode(code);

    try {
      // Display feedback to the user
      toast.info("Code detected! Joining classroom...");
      
      // Add some logging to help debug
      console.log("About to join class with code:", code);
      
      await joinClassWithCode(code);
      console.log("Successfully joined class");
      toast.success("Successfully joined classroom!");
      onClose(); // Close the dialog after joining
    } catch (error: any) {
      console.error("Error joining class after QR scan:", error);
      setScanError(error.message || "Failed to join the class. Please try manual code entry.");
      toast.error("Failed to join classroom. Please try again.");
      // Reset scan state after a delay to allow for another attempt
      setTimeout(() => {
        setScanComplete(false);
        setScanError(null);
        setProcessingCode(null);
      }, 3000);
    }
  };

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
