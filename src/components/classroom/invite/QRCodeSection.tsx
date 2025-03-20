
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeSectionProps {
  showQRCode: boolean;
  toggleQRCode: () => void;
  joinUrl: string;
  classroomName: string;
}

export const QRCodeSection = ({
  showQRCode,
  toggleQRCode,
  joinUrl,
  classroomName,
}: QRCodeSectionProps) => {
  const { toast } = useToast();
  const [downloadingQR, setDownloadingQR] = useState(false);
  
  const downloadQRCode = () => {
    try {
      setDownloadingQR(true);
      const qrCodeElement = document.getElementById("qr-code-container");
      
      if (!qrCodeElement) {
        throw new Error("QR code element not found");
      }
      
      const svgElement = qrCodeElement.querySelector("svg");
      if (!svgElement) {
        throw new Error("SVG element not found");
      }
      
      // Get SVG content
      const svgContent = new XMLSerializer().serializeToString(svgElement);
      
      // Create a canvas element to draw the SVG
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not create canvas context");
      }
      
      // Set canvas dimensions
      const size = 300;
      canvas.width = size;
      canvas.height = size;
      
      // Create an image element to load the SVG
      const img = new Image();
      img.onload = () => {
        // Draw white background and the image
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        
        // Convert canvas to data URL and download
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `${classroomName.replace(/\s+/g, '-')}-invite-qr.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setDownloadingQR(false);
        toast({
          title: "QR Code Downloaded",
          description: "The QR code has been saved to your device.",
        });
      };
      
      // Load the SVG into the image
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      img.src = URL.createObjectURL(blob);
    } catch (error: any) {
      console.error("Error downloading QR code:", error);
      setDownloadingQR(false);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download QR code",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="mt-4">
      <Card className="p-4 flex flex-col items-center bg-black/50 border-purple-500/20">
        <div id="qr-code-container" className="bg-white p-4 rounded mb-4">
          <QRCodeSVG
            value={joinUrl}
            size={200}
            level="H"
            includeMargin={false}
            className="mx-auto"
          />
        </div>
        
        <div className="text-sm text-center text-gray-300 mb-4">
          Students can scan this QR code to join your class.
        </div>
        
        <Button
          onClick={downloadQRCode}
          disabled={downloadingQR}
          variant="outline"
          className="border-purple-500/30 bg-black/50 hover:bg-purple-600/20"
        >
          <Download className="w-4 h-4 mr-2" />
          {downloadingQR ? "Processing..." : "Download QR Code"}
        </Button>
      </Card>
    </div>
  );
};
