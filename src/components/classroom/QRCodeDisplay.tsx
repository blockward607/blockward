
import { Card } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Link } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface QRCodeDisplayProps {
  value: string;
  title?: string;
  className?: string;
  showDownloadButton?: boolean;
  showCopyLinkButton?: boolean;
  downloadFileName?: string;
  size?: number;
}

export const QRCodeDisplay = ({ 
  value, 
  title, 
  className = "",
  showDownloadButton = true,
  showCopyLinkButton = true,
  downloadFileName = "class-invite-qr",
  size = 200
}: QRCodeDisplayProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleDownloadQR = () => {
    try {
      setIsDownloading(true);
      
      // Create a canvas from the QR code
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error("Unable to create canvas context");
      }
      
      // Set canvas dimensions
      canvas.width = size;
      canvas.height = size;
      
      // Create a new image to draw the QR code
      const img = new Image();
      img.src = document.getElementById('qr-code-svg')?.querySelector('svg')?.outerHTML
        ? 'data:image/svg+xml;base64,' + btoa(document.getElementById('qr-code-svg')?.querySelector('svg')?.outerHTML || '')
        : '';
        
      img.onload = () => {
        // Draw white background
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the QR code image
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to PNG and download
        const url = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `${downloadFileName}.png`;
        link.href = url;
        link.click();
        
        toast.success("QR code downloaded successfully");
        setIsDownloading(false);
      };
      
      img.onerror = (error) => {
        console.error("Error creating QR image:", error);
        toast.error("Failed to download QR code");
        setIsDownloading(false);
      };
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast.error("Failed to download QR code");
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    try {
      setIsCopying(true);
      navigator.clipboard.writeText(value);
      toast.success("Link copied to clipboard");
    } catch (error) {
      console.error("Error copying link:", error);
      toast.error("Failed to copy link");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Card className={`p-4 bg-white rounded-md flex flex-col items-center ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-black mb-2">{title}</h3>
      )}
      <div id="qr-code-svg">
        <QRCodeSVG 
          value={value}
          size={size}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"L"}
          includeMargin={false}
        />
      </div>
      <p className="text-xs text-center text-black mt-2">
        Scan this QR code to join the class
      </p>
      
      {(showDownloadButton || showCopyLinkButton) && (
        <div className="flex gap-2 mt-3">
          {showDownloadButton && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-black border-black hover:bg-black/10"
              onClick={handleDownloadQR}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-1" />
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
          )}
          
          {showCopyLinkButton && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-black border-black hover:bg-black/10"
              onClick={handleCopyLink}
              disabled={isCopying}
            >
              <Link className="h-4 w-4 mr-1" />
              {isCopying ? "Copying..." : "Copy Link"}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
