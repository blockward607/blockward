
import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface UseScannerLogicProps {
  onScan: (code: string) => void;
  qrBoxId: string;
}

export function useScannerLogic({ onScan, qrBoxId }: UseScannerLogicProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);

  // Set up cleanup function for component unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
    } catch (error) {
      console.error("Error in scan handler:", error);
      setIsPaused(false);
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current || isStopping) return;

    setIsStopping(true);
    try {
      if (scannerRef.current) {
        // Try to stop regardless of state
        try {
          await scannerRef.current.stop();
          console.log("Scanner stopped successfully");
        } catch (stopError) {
          console.log("Scanner was not running, no need to stop:", stopError);
        }
      }
    } catch (error) {
      console.log("Safe scanner stop error (can be ignored):", error);
    } finally {
      scannerRef.current = null;
      if (mountedRef.current) {
        setScannerInitialized(false);
        setIsStopping(false);
      }
    }
  };

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
        scannerRef.current = new Html5Qrcode(qrBoxId);
      } else {
        console.log("Using existing QR scanner instance");
      }

      const scanner = scannerRef.current;

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

  useEffect(() => {
    // Initialize the scanner when component mounts
    if (!scannerInitialized && !isStopping) {
      initScanner();
    }

    return () => {
      // Clean up scanner on unmount
      if (scannerRef.current && scannerInitialized && !isStopping) {
        console.log("Cleaning up QR scanner on unmount");
        stopScanner();
      }
    };
  }, [scannerInitialized, isStopping]);

  return {
    isLoading,
    error,
    hasPermission,
    scannerInitialized,
    isPaused,
    isStopping,
    stopScanner,
  };
}
