
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
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let scanner: Html5Qrcode | null = null;

    const initScanner = async () => {
      try {
        setIsLoading(true);
        const qrBoxId = "qr-reader";
        scanner = new Html5Qrcode(qrBoxId);
        scannerRef.current = scanner;

        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const cameraId = devices[0].id;
          
          await scanner.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              // On QR code detected
              console.log("QR code detected:", decodedText);
              onScan(decodedText);
              if (scanner) {
                scanner.stop().catch(error => console.error("Error stopping scanner:", error));
              }
            },
            (errorMessage) => {
              // Ignore errors during scanning
              console.log(errorMessage);
            }
          );
        } else {
          setError("No camera devices found");
        }
      } catch (err) {
        console.error("Error initializing scanner:", err);
        setError("Unable to access camera. Please ensure camera permissions are granted.");
      } finally {
        setIsLoading(false);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(error => console.error("Error stopping scanner:", error));
      }
    };
  }, [onScan]);

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
        id="qr-reader" 
        ref={qrBoxRef} 
        className={`w-full max-w-xs ${isLoading || error ? 'hidden' : ''}`}
      >
        {/* Scanner will render here */}
      </div>

      {!isLoading && !error && (
        <div className="mt-4">
          <p className="text-sm text-gray-300 mb-2">
            Position the QR code within the box.
          </p>
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="mt-2"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
