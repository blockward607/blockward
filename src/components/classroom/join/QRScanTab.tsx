
import { useState } from "react";
import { Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJoinClassContext } from "./JoinClassContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { QRCodeScanner } from "../QRCodeScanner";

export const QRScanTab = () => {
  const { loading, error, joinClassWithCode } = useJoinClassContext();
  const [scanning, setScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const handleQRCodeScanned = (code: string) => {
    console.log("QR code scanned:", code);
    
    // Prevent duplicate processing of the same code
    if (lastScannedCode === code) {
      console.log("Same code scanned again, ignoring");
      return;
    }
    
    setLastScannedCode(code);
    setScanning(false);
    joinClassWithCode(code);
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={() => setScanning(!scanning)}
          disabled={loading}
          className="bg-purple-700 hover:bg-purple-800"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              {scanning ? "Cancel Scan" : "Scan QR Code"}
            </>
          )}
        </Button>
        
        {scanning && (
          <div className="mt-4 w-full max-w-md bg-black/50 border border-purple-500/30 rounded-lg p-4">
            <QRCodeScanner
              onScan={handleQRCodeScanned}
              onClose={() => setScanning(false)}
            />
          </div>
        )}
        
        {!scanning && (
          <p className="text-xs text-gray-400 text-center">
            Click the button above to activate your camera and scan the class QR code.
          </p>
        )}
      </div>
    </div>
  );
};
