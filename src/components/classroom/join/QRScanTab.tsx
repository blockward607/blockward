
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useJoinClassContext } from "./JoinClassContext";
import { QRCodeScanner } from "../QRCodeScanner";
import { Scanner, X } from "lucide-react";

export const QRScanTab = () => {
  const { 
    scannerOpen, 
    setScannerOpen, 
    error, 
    setError,
    handleScanResult
  } = useJoinClassContext();

  // Clear error when opening scanner
  useEffect(() => {
    if (scannerOpen) {
      setError(null);
    }
  }, [scannerOpen, setError]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        {scannerOpen ? (
          <div className="relative">
            <Button
              className="absolute right-0 top-0 z-10 bg-red-900/50 hover:bg-red-900 rounded-full p-2 m-2"
              size="icon"
              variant="outline"
              onClick={() => setScannerOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="bg-black/30 rounded-xl overflow-hidden">
              <QRCodeScanner 
                onScanSuccess={handleScanResult}
                onScanError={(err) => setError(err.message || "Error scanning QR code")}
              />
            </div>
            
            <p className="text-sm text-gray-400 mt-2 px-2">
              Position the QR code within the scanner frame
            </p>
          </div>
        ) : (
          <Button
            onClick={() => setScannerOpen(true)}
            className="w-full bg-purple-700 hover:bg-purple-800"
          >
            <Scanner className="mr-2 h-4 w-4" />
            Scan QR Code
          </Button>
        )}
        
        {error && !scannerOpen && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
        
        {!scannerOpen && (
          <p className="text-xs text-gray-400 mt-2">
            Scan the QR code provided by your teacher to join their class
          </p>
        )}
      </div>
    </div>
  );
};
