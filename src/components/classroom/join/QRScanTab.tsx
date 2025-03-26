
import { useState, useEffect } from "react";
import { Loader2, Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useJoinClassContext } from "./JoinClassContext";
import { useJoinClass } from "./useJoinClass";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const QRScanTab = () => {
  const { loading, error, setInvitationCode } = useJoinClassContext();
  const { handleJoinClass } = useJoinClass();
  const [scanning, setScanning] = useState(false);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");

  useEffect(() => {
    let qrScanner: Html5QrcodeScanner | null = null;

    const initializeScanner = () => {
      if (scanning && !scannerInitialized) {
        setScannerMessage("Starting camera...");

        // Clean up previous scanner instance if it exists
        const oldElement = document.getElementById("qr-reader");
        if (oldElement) {
          oldElement.innerHTML = "";
        }

        try {
          qrScanner = new Html5QrcodeScanner(
            "qr-reader",
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              showTorchButtonIfSupported: true,
              showZoomSliderIfSupported: true,
            },
            false
          );

          qrScanner.render(
            // Success callback
            (decodedText) => {
              console.log("QR Code scanned:", decodedText);
              setScannerMessage("QR Code detected!");
              
              // Stop scanning
              if (qrScanner) {
                qrScanner.clear();
              }
              
              // Process the code and join the class
              setInvitationCode(decodedText);
              handleJoinClass();
              setScanning(false);
            },
            // Error callback
            (errorMessage) => {
              // Ignore errors during scanning - these are usually just frames without QR codes
              console.debug("QR Scanner error (normal during scanning):", errorMessage);
            }
          );
          
          setScannerInitialized(true);
          setScannerMessage("Camera active. Point at a QR code.");
        } catch (error) {
          console.error("Error initializing QR scanner:", error);
          setScannerMessage("Error accessing camera. Please check permissions.");
          setScanning(false);
        }
      }
    };

    if (scanning) {
      initializeScanner();
    }

    return () => {
      if (qrScanner) {
        try {
          qrScanner.clear();
        } catch (error) {
          console.error("Error clearing QR scanner:", error);
        }
      }
    };
  }, [scanning, scannerInitialized, setInvitationCode, handleJoinClass]);

  const toggleScanner = () => {
    if (scanning) {
      setScannerInitialized(false);
    }
    setScanning(!scanning);
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
          onClick={toggleScanner}
          disabled={loading}
          variant={scanning ? "destructive" : "default"}
          className={scanning ? "bg-red-700 hover:bg-red-800" : "bg-purple-700 hover:bg-purple-800"}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : scanning ? (
            <>
              <CameraOff className="w-4 h-4 mr-2" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Scan QR Code
            </>
          )}
        </Button>
        
        {scanning && (
          <div className="flex flex-col items-center gap-2 w-full">
            <p className="text-sm text-center text-gray-300">{scannerMessage}</p>
            <div 
              id="qr-reader" 
              className="w-full max-w-[300px] overflow-hidden rounded-lg"
            ></div>
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
