
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2, X } from "lucide-react";

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export const QRCodeScanner = ({ onScan, onClose }: QRCodeScannerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrBoxId = "qr-reader";
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  useEffect(() => {
    let scanner: Html5Qrcode | null = null;

    const initScanner = async () => {
      try {
        setIsLoading(true);
        scanner = new Html5Qrcode(qrBoxId);
        scannerRef.current = scanner;

        // Check for camera permissions first
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
          setHasPermission(true);
        } catch (permissionError) {
          console.error("Camera permission denied:", permissionError);
          setError("Camera access denied. Please enable camera permissions and try again.");
          setIsLoading(false);
          return;
        }

        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const cameraId = devices[0].id;
          
          await scanner.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
              // On QR code detected
              console.log("QR code detected:", decodedText);
              
              // Process the QR code directly without any extraction
              handleSuccessfulScan(scanner, decodedText.trim());
            },
            (errorMessage) => {
              // Ignore continuous scanning errors
            }
          ).catch(err => {
            console.error("Error starting scanner:", err);
            setError("Error starting the camera. Please try again.");
            setIsLoading(false);
          });
          
          setIsLoading(false);
          setScannerInitialized(true);
        } else {
          setError("No camera devices found");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error initializing scanner:", err);
        setError("Unable to access camera. Please ensure camera permissions are granted.");
        setIsLoading(false);
      }
    };

    // Only initialize the scanner if the component is mounted
    const qrReaderElement = document.getElementById(qrBoxId);
    if (qrReaderElement) {
      initScanner();
    } else {
      console.error("QR reader element not found");
      setError("QR scanner initialization failed. Please try again.");
      setIsLoading(false);
    }

    return () => {
      // Make sure we don't try to stop an already stopped scanner
      if (scannerRef.current && scannerInitialized && !isStopping) {
        setIsStopping(true);
        scannerRef.current
          .stop()
          .then(() => {
            console.log("Scanner stopped successfully");
            scannerRef.current = null;
          })
          .catch(error => {
            // Just log the error but don't throw it to prevent crashing
            console.log("Safe scanner stop error (can be ignored):", error);
          })
          .finally(() => {
            setIsStopping(false);
          });
      }
    };
  }, [onScan]);

  // Safely handle successful scan and stop scanner
  const handleSuccessfulScan = async (scanner: Html5Qrcode | null, decodedText: string) => {
    if (!scanner) return;
    
    try {
      // Pause scanning to prevent multiple scans
      await scanner.pause(true);
      
      // Process the code
      onScan(decodedText);
      
      // Safely stop the scanner after successful processing
      setIsStopping(true);
      try {
        await scanner.stop();
        console.log("Scanner stopped after successful scan");
      } catch (stopError) {
        console.log("Error while stopping scanner (can be ignored):", stopError);
      } finally {
        setIsStopping(false);
      }
    } catch (error) {
      console.error("Error in scan handler:", error);
      // If there's an error processing, we should still try to stop the scanner
      try {
        await scanner.stop();
      } catch (stopError) {
        // Ignore second-level errors
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      {isLoading && (
        <div className="py-8 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
          <p>Accessing camera...</p>
        </div>
      )}

      {error && (
        <div className="py-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      )}

      <div 
        id={qrBoxId} 
        className={`w-full max-w-xs ${isLoading || error ? 'hidden' : ''}`}
      >
        {/* Scanner will render here */}
      </div>

      {!isLoading && !error && (
        <div className="mt-4">
          <p className="text-sm text-gray-300 mb-2">
            Position the QR code within the box.
          </p>
          {scannerInitialized && (
            <p className="text-xs text-green-400 mb-2">
              Camera active. Scanning for QR codes...
            </p>
          )}
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="mt-2"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
