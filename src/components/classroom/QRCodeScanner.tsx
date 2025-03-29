
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Html5Qrcode, Html5QrcodeScanType } from "html5-qrcode";
import { Loader2, X } from "lucide-react";
import { codeExtractor } from "@/utils/codeExtractor";

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
              supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
            },
            (decodedText) => {
              // On QR code detected
              console.log("QR code detected:", decodedText);
              
              // Use the codeExtractor to process the QR code content
              const extractedCode = codeExtractor.extractJoinCode(decodedText);
              
              if (extractedCode) {
                console.log("Extracted code from QR:", extractedCode);
                
                // Stop scanning temporarily to prevent multiple scans
                if (scanner) {
                  scanner.pause(true);
                  
                  // Small delay to ensure we don't double-process
                  setTimeout(() => {
                    onScan(extractedCode);
                    
                    // Stop scanner after successful processing
                    if (scanner) {
                      scanner.stop().catch(error => console.error("Error stopping scanner:", error));
                    }
                  }, 500);
                }
              } else {
                // If no valid code, try to use the raw text
                if (decodedText && decodedText.trim()) {
                  console.log("No valid code extracted, using raw QR content");
                  onScan(decodedText.trim());
                  
                  if (scanner) {
                    scanner.stop().catch(error => console.error("Error stopping scanner:", error));
                  }
                } else {
                  console.warn("QR code content is empty or invalid");
                }
              }
            },
            (errorMessage) => {
              // Ignore errors during scanning
              console.log(errorMessage);
            }
          );
          setIsLoading(false);
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
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
