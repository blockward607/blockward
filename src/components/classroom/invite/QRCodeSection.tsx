
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { QRCodeDisplay } from "../QRCodeDisplay";

interface QRCodeSectionProps {
  showQRCode: boolean;
  toggleQRCode: () => void;
  joinUrl: string;
  classroomName: string;
}

export const QRCodeSection = ({ 
  showQRCode, 
  toggleQRCode, 
  joinUrl, 
  classroomName 
}: QRCodeSectionProps) => {
  return (
    <>
      <Button
        onClick={toggleQRCode}
        className={`${showQRCode ? 'bg-purple-800' : 'bg-purple-600/50'} hover:bg-purple-700 w-full`}
        variant="outline"
      >
        <QrCode className="w-4 h-4 mr-2" />
        {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
      </Button>
      
      {showQRCode && (
        <QRCodeDisplay 
          value={joinUrl}
          title={`Join ${classroomName}`}
          className="mt-4"
        />
      )}
    </>
  );
};
