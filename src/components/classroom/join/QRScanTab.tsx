
import { Button } from "@/components/ui/button";
import { QrCode, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { QRCodeScanner } from "../QRCodeScanner";
import { useJoinClassContext } from "./JoinClassContext";
import { useJoinClass } from "./useJoinClass";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useCallback, useEffect } from "react";

export const QRScanTab = () => {
  const { setInvitationCode, scannerOpen, setScannerOpen, loading, error } = useJoinClassContext();
  const { handleJoinClass } = useJoinClass();
  const { toast } = useToast();

  // Helper function to extract code from URL
  const extractCodeFromUrl = useCallback((url: string): string | null => {
    try {
      // First check if it's a URL with a code parameter
      if (url.includes('?code=')) {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('code');
      } 
      // Check for direct join URL
      else if (url.includes('/classes/join/')) {
        const parts = url.split('/classes/join/');
        if (parts.length > 1) {
          return parts[1].split('?')[0]; // Remove any query params
        }
      }
      // Check for classes URL with code parameter
      else if (url.includes('/classes') && url.includes('?code=')) {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('code');
      }
      return null;
    } catch (error) {
      console.error("Error parsing URL:", error);
      return null;
    }
  }, []);

  const handleQRCodeScanned = useCallback((code: string) => {
    setScannerOpen(false);
    if (!code) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Empty QR code scanned"
      });
      return;
    }
    
    try {
      console.log("QR Code scanned:", code);
      
      // Process the scanned code - handle both direct codes and URLs
      let inviteCode = code.trim();
      
      // Check if code is a URL and try to extract the invitation code
      if (code.includes('http')) {
        const extractedCode = extractCodeFromUrl(code);
        if (extractedCode) {
          inviteCode = extractedCode.trim();
          console.log("Extracted code from URL:", inviteCode);
        } else {
          console.log("Could not extract code from URL, using full code");
        }
      }
      
      // Set code and attempt to join
      setInvitationCode(inviteCode);
      console.log("Setting invitation code to:", inviteCode);
      
      // Auto-join class after scan with short delay
      setTimeout(() => handleJoinClass(), 300);
    } catch (error) {
      console.error("Error processing QR code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process QR code"
      });
    }
  }, [setScannerOpen, toast, setInvitationCode, handleJoinClass, extractCodeFromUrl]);

  // Attempt to get code from URL on component mount (for direct links)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    
    if (codeParam && codeParam.trim()) {
      console.log("Found code parameter in URL:", codeParam);
      setInvitationCode(codeParam.trim());
      // Don't auto-join here, let user click the button
    }
  }, [setInvitationCode]);

  return (
    <div className="text-center space-y-3">
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button
        onClick={() => setScannerOpen(true)}
        className="bg-purple-700 hover:bg-purple-800 mx-auto"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <QrCode className="w-4 h-4 mr-2" />
            Scan QR Code
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-400 mt-2">
        Use your device's camera to scan the QR code from your teacher.
      </p>

      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="bg-[#25293A] border border-purple-500/30 max-w-md">
          <DialogTitle>Scan QR Code</DialogTitle>
          <QRCodeScanner onScan={handleQRCodeScanned} onClose={() => setScannerOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
