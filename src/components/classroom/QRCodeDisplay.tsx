
import { QrCode } from "lucide-react";
import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { Card } from "@/components/ui/card";

interface QRCodeDisplayProps {
  value: string;
  title?: string;
  size?: number;
  className?: string;
}

export const QRCodeDisplay = ({ value, title, size = 200, className }: QRCodeDisplayProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!value || !qrRef.current) return;
    
    const qrCode = new QRCodeStyling({
      width: size,
      height: size,
      data: value,
      image: undefined,
      dotsOptions: {
        color: "#8b5cf6",
        type: "rounded"
      },
      backgroundOptions: {
        color: "#121212",
      },
      cornersSquareOptions: {
        color: "#6d28d9"
      },
      cornersDotOptions: {
        color: "#4c1d95"
      },
    });
    
    qrRef.current.innerHTML = '';
    qrCode.append(qrRef.current);
    
    return () => {
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
      }
    };
  }, [value, size]);
  
  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.download = `${title || 'class-invitation'}-qrcode.png`;
    link.href = qrRef.current?.querySelector('canvas')?.toDataURL() || '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className={`p-4 bg-black/40 flex flex-col items-center ${className || ''}`}>
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      <div ref={qrRef} className="my-2" />
      {value && (
        <button
          onClick={downloadQRCode}
          className="mt-2 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
        >
          <QrCode className="w-4 h-4" />
          Download QR Code
        </button>
      )}
    </Card>
  );
};
