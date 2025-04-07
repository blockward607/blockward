
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Accessing camera..." }) => {
  return (
    <div className="py-8 flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
      <p>{message}</p>
    </div>
  );
};

interface ErrorStateProps {
  error: string;
  onClose: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onClose }) => {
  return (
    <div className="py-8 text-center">
      <p className="text-red-400 mb-4">{error}</p>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
};

interface ScannerControlsProps {
  scannerInitialized: boolean;
  isPaused: boolean;
  onClose: () => void;
}

export const ScannerControls: React.FC<ScannerControlsProps> = ({ 
  scannerInitialized, 
  isPaused, 
  onClose 
}) => {
  return (
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
        onClick={onClose} 
        variant="outline" 
        className="mt-2"
      >
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
    </div>
  );
};
