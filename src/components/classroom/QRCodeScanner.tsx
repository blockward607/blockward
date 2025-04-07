import React from "react";
import { useScannerLogic } from "./scanner/useScannerLogic";
import { LoadingState, ErrorState, ScannerControls } from "./scanner/ScannerStates";

interface QRCodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export const QRCodeScanner = ({ onScan, onClose }: QRCodeScannerProps) => {
  const qrBoxId = "qr-reader";
  
  const {
    isLoading,
    error,
    scannerInitialized,
    isPaused,
    isStopping,
    stopScanner
  } = useScannerLogic({ onScan, qrBoxId });

  const handleClose = () => {
    // Safe cleanup before calling onClose
    if (!isStopping) {
      stopScanner();
    }
    onClose();
  };

  return (
    <div className="flex flex-col items-center p-4">
      {isLoading && <LoadingState />}

      {error && <ErrorState error={error} onClose={handleClose} />}

      <div 
        id={qrBoxId} 
        className={`w-full max-w-xs ${isLoading || error ? 'hidden' : ''}`}
      >
        {/* Scanner will render here */}
      </div>

      {!isLoading && !error && (
        <ScannerControls 
          scannerInitialized={scannerInitialized}
          isPaused={isPaused}
          onClose={handleClose}
        />
      )}
    </div>
  );
};
