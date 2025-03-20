
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

  // Helper function to extract code from URL or direct code
  const extractCodeFromUrl = useCallback((input: string): string | null => {
    try {
      console.log("Extracting code from input:", input);
      
      // Clean up input
      const trimmedInput = input.trim();
      
      // If it's a QR code with just the code itself
      if (/^[A-Z0-9]{4,10}$/i.test(trimmedInput)) {
        console.log("Input appears to be a direct code:", trimmedInput);
        return trimmedInput;
      }
      
      // Handle URL with code parameter
      if (trimmedInput.includes('?code=')) {
        try {
          const urlObj = new URL(trimmedInput);
          const codeParam = urlObj.searchParams.get('code');
          console.log("Found code parameter in URL:", codeParam);
          if (codeParam && codeParam.trim()) {
            return codeParam.trim();
          }
        } catch (e) {
          console.error("Error parsing URL:", e);
          // Continue to try other methods
        }
      }
      
      // Handle URL patterns with the code embedded in the path
      const urlPatterns = [
        /\/classes\/join\/([A-Z0-9]{4,10})/i,  // /classes/join/ABC123
        /\/join\/([A-Z0-9]{4,10})/i,            // /join/ABC123
        /\/invite\/([A-Z0-9]{4,10})/i,          // /invite/ABC123
      ];
      
      for (const pattern of urlPatterns) {
        const match = trimmedInput.match(pattern);
        if (match && match[1]) {
          console.log("Found code in URL path:", match[1]);
          return match[1];
        }
      }
      
      // Last resort: Check if the input contains something that looks like a code
      const codeMatch = trimmedInput.match(/[A-Z0-9]{4,10}/i);
      if (codeMatch) {
        console.log("Extracted possible code from text:", codeMatch[0]);
        return codeMatch[0];
      }
      
      console.log("Could not extract code from input");
      return null;
    } catch (error) {
      console.error("Error in code extraction:", error);
      return null;
    }
  }, []);

  const handleQRCodeScanned = useCallback((scannedContent: string) => {
    setScannerOpen(false);
    
    if (!scannedContent || scannedContent.trim() === '') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Empty QR code scanned"
      });
      return;
    }
    
    try {
      console.log("QR Code scanned content:", scannedContent);
      
      // Extract invitation code from the scanned content
      const extractedCode = extractCodeFromUrl(scannedContent);
      
      if (!extractedCode) {
        toast({
          variant: "destructive",
          title: "Invalid QR Code",
          description: "Could not find a valid invitation code in the QR code"
        });
        return;
      }
      
      // Normalize code to uppercase for consistency
      const normalizedCode = extractedCode.trim().toUpperCase();
      console.log("Extracted and normalized code:", normalizedCode);
      
      // Set the code in the context
      setInvitationCode(normalizedCode);
      
      // Attempt to join with a slight delay to ensure context is updated
      setTimeout(() => {
        console.log("Auto-joining with code:", normalizedCode);
        handleJoinClass();
      }, 300);
      
    } catch (error: any) {
      console.error("Error processing QR code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process QR code: " + (error.message || "Unknown error")
      });
    }
  }, [setScannerOpen, toast, setInvitationCode, handleJoinClass, extractCodeFromUrl]);

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
