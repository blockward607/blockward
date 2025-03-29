
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCodeIcon } from "lucide-react";
import { HTML5QrcodeScanType, Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";
import { useJoinClassContext } from "./JoinClassContext";

export interface QRScanTabProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export const QRScanTab: React.FC<QRScanTabProps> = ({ open, onOpenChange, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { joinClassWithCode } = useJoinClassContext();

  useEffect(() => {
    if (open && !scannerRef.current) {
      // Initialize scanner when tab becomes active
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [HTML5QrcodeScanType.SCAN_TYPE_CAMERA],
        },
        false
      );

      scanner.render(
        (decodedText) => {
          console.log(`QR Code detected: ${decodedText}`);
          joinClassWithCode(decodedText);
          scanner.clear();
          onClose();
        },
        (errorMessage) => {
          console.log(`QR Code error: ${errorMessage}`);
        }
      );

      scannerRef.current = scanner;
    } else if (!open && scannerRef.current) {
      // Clean up scanner when tab is no longer active
      scannerRef.current.clear();
      scannerRef.current = null;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, [open, onClose, joinClassWithCode]);

  return (
    <div className="p-1">
      <Card className="bg-black/20 border-purple-500/30 p-4 mb-4">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-purple-800/30 p-3">
            <QrCodeIcon className="h-5 w-5 text-purple-300" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Scan QR Code</h3>
            <p className="text-xs text-gray-400">
              Point your camera at the QR code shared by your teacher
            </p>
          </div>
        </div>
      </Card>

      <div id="qr-reader" className="w-full mb-4"></div>

      <Button
        variant="outline"
        className="w-full border-purple-500/30"
        onClick={onClose}
      >
        Cancel Scanning
      </Button>
    </div>
  );
};
