
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2, X } from "lucide-react";
import { codeExtractor } from "@/utils/codeExtractor";

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
              
              try {
                // Use the codeExtractor to process the QR code content
                const extractedCode = codeExtractor.extractJoinCode(decodedText);
                
                if (extractedCode) {
                  console.log("Extracted code from QR:", extractedCode);
                  
                  // Stop scanning to prevent multiple scans
                  if (scanner) {
                    scanner.pause();
                    
                    // Process the QR code
                    onScan(extractedCode);
                    
                    // Stop scanner after successful processing
                    setTimeout(() => {
                      if (scanner) {
                        scanner.stop().catch(error => console.error("Error stopping scanner:", error));
                      }
                    }, 300);
                  }
                } else if (decodedText && decodedText.trim()) {
                  // If no valid code extracted, use the raw text
                  console.log("No valid code extracted, using raw QR content:", decodedText.trim());
                  
                  // Stop scanning
                  if (scanner) {
                    scanner.pause();
                    
                    // Process the raw QR code
                    onScan(decodedText.trim());
                    
                    // Stop scanner after successful processing
                    setTimeout(() => {
                      if (scanner) {
                        scanner.stop().catch(error => console.error("Error stopping scanner:", error));
                      }
                    }, 300);
                  }
                } else {
                  console.warn("QR code content is empty or invalid");
                }
              } catch (err) {
                console.error("Error processing QR code:", err);
              }
            },
            (errorMessage) => {
              // Ignore continuous scanning errors
              // console.log("QR scan error:", errorMessage);
            }
          ).catch(err => {
            console.error("Error starting scanner:", err);
            setError("Error starting the camera. Please try again.");
            setIsLoading(false);
          });
          
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
