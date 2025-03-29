
import React, { useState } from "react";
import { useJoinClassContext } from "./JoinClassContext";
import { QRCodeScanner } from "../QRCodeScanner";
import { Loader2 } from "lucide-react";

export interface QRScanTabProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export const QRScanTab: React.FC<QRScanTabProps> = ({ open, onOpenChange, onClose }) => {
  const { joinClassWithCode, loading } = useJoinClassContext();
  const [scanComplete, setScanComplete] = useState(false);

  const handleCodeScanned = async (code: string) => {
    console.log(`QR Code scanned: ${code}`);
    setScanComplete(true);
    try {
      await joinClassWithCode(code);
      onClose(); // Close the dialog after joining
    } catch (error) {
      console.error("Error joining class after QR scan:", error);
      setScanComplete(false);
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
      </div>
    );
  }

  return (
    <div className="p-1">
      <QRCodeScanner onScan={handleCodeScanned} onClose={onClose} />
    </div>
  );
};
