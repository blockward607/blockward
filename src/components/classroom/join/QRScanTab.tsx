
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { QRCodeScanner } from "../QRCodeScanner";
import { useJoinClassContext } from "./JoinClassContext";

export const QRScanTab = () => {
  const { setInvitationCode, scannerOpen, setScannerOpen } = useJoinClassContext();

  const handleQRCodeScanned = (code: string) => {
    setScannerOpen(false);
    if (code) {
      try {
        // Process the scanned code
        // Handle both direct codes and URLs with code parameter
        if (code.includes('?code=')) {
          const url = new URL(code);
          const codeParam = url.searchParams.get('code');
          if (codeParam) {
            setInvitationCode(codeParam);
            return;
          }
        }
        
        // If we couldn't parse it as a URL, use the raw code
        setInvitationCode(code);
      } catch (error) {
        // If there's an error parsing as URL, use the code directly
        setInvitationCode(code);
      }
    }
  };

  return (
    <div className="text-center">
      <Button
        onClick={() => setScannerOpen(true)}
        className="bg-purple-700 hover:bg-purple-800 mx-auto"
      >
        <QrCode className="w-4 h-4 mr-2" />
        Scan QR Code
      </Button>
      
      <p className="text-xs text-gray-400 mt-2">
        Use your device's camera to scan the QR code from your teacher.
      </p>

      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="bg-[#25293A] border border-purple-500/30 max-w-md">
          <DialogTitle>Scan QR Code</DialogTitle>
          <QRCodeScanner onScan={handleQRCodeScanned} onClose={() => setScannerOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
