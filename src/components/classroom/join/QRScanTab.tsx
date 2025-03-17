
import { Button } from "@/components/ui/button";
import { QrCode, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { QRCodeScanner } from "../QRCodeScanner";
import { useJoinClassContext } from "./JoinClassContext";
import { useJoinClass } from "./useJoinClass";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const QRScanTab = () => {
  const { setInvitationCode, scannerOpen, setScannerOpen, loading, error } = useJoinClassContext();
  const { handleJoinClass } = useJoinClass();
  const { toast } = useToast();

  const handleQRCodeScanned = (code: string) => {
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
      
      if (code.includes('?code=')) {
        try {
          const url = new URL(code);
          const codeParam = url.searchParams.get('code');
          if (codeParam) {
            inviteCode = codeParam.trim();
            console.log("Extracted code from URL:", inviteCode);
          }
        } catch (error) {
          console.error("Error parsing QR code URL:", error);
          // Continue with original code if URL parsing fails
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
  };

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
