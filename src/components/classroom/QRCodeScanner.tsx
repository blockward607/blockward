
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
  const [isPaused, setIsPaused] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Set up cleanup function for component unmount
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let scanner: Html5Qrcode | null = null;

    const initScanner = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if the DOM element exists before creating scanner
        const qrReaderElement = document.getElementById(qrBoxId);
        if (!qrReaderElement) {
          console.error("QR reader element not found");
          setError("QR scanner initialization failed. Please try again.");
          setIsLoading(false);
          return;
        }

        // Only create a new scanner if we don't have one already
        if (!scannerRef.current) {
          console.log("Creating new QR scanner instance");
          scanner = new Html5Qrcode(qrBoxId);
          scannerRef.current = scanner;
        } else {
          console.log("Using existing QR scanner instance");
          scanner = scannerRef.current;
        }

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
          
          // Only start scanning if we haven't already
          if (!scannerInitialized && !isStopping) {
            console.log("Starting QR scanner");
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
                if (mountedRef.current) {
                  handleSuccessfulScan(scanner, decodedText.trim());
                }
              },
              (errorMessage) => {
                // Ignore continuous scanning errors
              }
            ).catch(err => {
              if (mountedRef.current) {
                console.error("Error starting scanner:", err);
                setError("Error starting the camera. Please try again.");
                setIsLoading(false);
              }
            });
            
            if (mountedRef.current) {
              setIsLoading(false);
              setScannerInitialized(true);
              setIsPaused(false);
            }
          }
        } else {
          if (mountedRef.current) {
            setError("No camera devices found");
            setIsLoading(false);
          }
        }
      } catch (err) {
        if (mountedRef.current) {
          console.error("Error initializing scanner:", err);
          setError("Unable to access camera. Please ensure camera permissions are granted.");
          setIsLoading(false);
        }
      }
    };

    // Only initialize the scanner if the component is mounted
    initScanner();

    return () => {
      // Make sure we don't try to stop an already stopped scanner
      if (scannerRef.current && scannerInitialized && !isStopping) {
        console.log("Cleaning up QR scanner on unmount");
        setIsStopping(true);
        
        const stopScanner = async () => {
          try {
            // Check if scanner is running before stopping
            if (scannerRef.current) {
              // Instead of checking scanner state, just try stopping and handle any errors
              try {
                await scannerRef.current.stop();
                console.log("Scanner stopped successfully on unmount");
              } catch (stopError) {
                console.log("Scanner was not running, no need to stop:", stopError);
              }
            }
          } catch (error) {
            // Just log the error but don't throw it to prevent crashing
            console.log("Safe scanner stop error (can be ignored):", error);
          } finally {
            scannerRef.current = null;
            if (mountedRef.current) {
              setScannerInitialized(false);
              setIsStopping(false);
            }
          }
        };
        
        stopScanner();
      }
    };
  }, [scannerInitialized, isStopping]);

  // Safely handle successful scan and stop scanner
  const handleSuccessfulScan = async (scanner: Html5Qrcode | null, decodedText: string) => {
    if (!scanner || isStopping || isPaused) return;
    
    try {
      console.log("QR code scan successful, pausing scanner");
      setIsPaused(true);
      
      // Safely pause scanning to prevent multiple scans
      try {
        await scanner.pause(true);
      } catch (pauseError) {
        console.log("Non-critical error pausing scanner:", pauseError);
      }
      
      // Process the code
      onScan(decodedText);
      
      // We don't immediately stop the scanner here anymore
      // It will be stopped when the component unmounts or is closed
    } catch (error) {
      console.error("Error in scan handler:", error);
      setIsPaused(false);
    }
  };

  const handleClose = () => {
    // Safe cleanup before calling onClose
    if (scannerRef.current && !isStopping) {
      setIsStopping(true);
      
      const stopBeforeClose = async () => {
        try {
          if (scannerRef.current) {
            try {
              // Instead of checking the scanner state, try stopping and catch any errors
              await scannerRef.current.stop();
              console.log("Scanner stopped before close");
            } catch (stopError) {
              console.log("Error stopping scanner before close (can be ignored):", stopError);
            }
            
            scannerRef.current = null;
          }
        } finally {
          setScannerInitialized(false);
          setIsStopping(false);
          onClose();
        }
      };
      
      stopBeforeClose();
    } else {
      onClose();
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
          <Button onClick={handleClose}>Close</Button>
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
          {scannerInitialized && !isPaused && (
            <p className="text-xs text-green-400 mb-2">
              Camera active. Scanning for QR codes...
            </p>
          )}
          {isPaused && (
            <p className="text-xs text-amber-400 mb-2">
              QR code detected. Processing...
            </p>
          )}
          <Button 
            onClick={handleClose} 
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
