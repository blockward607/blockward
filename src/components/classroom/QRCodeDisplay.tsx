
import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface QRCodeDisplayProps {
  value: string;
  title?: string;
  className?: string;
}

export const QRCodeDisplay = ({ value, title, className = "" }: QRCodeDisplayProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!qrRef.current) return;
    
    const qrCode = new QRCodeStyling({
      width: 200,
      height: 200,
      data: value,
      dotsOptions: {
        color: "#8b5cf6",
        type: "rounded"
      },
      cornersSquareOptions: {
        color: "#6d28d9",
        type: "extra-rounded"
      },
      cornersDotOptions: {
        color: "#4c1d95",
      },
      backgroundOptions: {
        color: "#111111",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5
      }
    });
    
    qrRef.current.innerHTML = '';
    qrCode.append(qrRef.current);
    
    return () => {
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
      }
    };
  }, [value]);
  
  const handleDownload = () => {
    // Implement download functionality if needed
  };
  
  return (
    <Card className={`p-4 flex flex-col items-center ${className} bg-black/40 border border-purple-500/30`}>
      {title && <h3 className="text-lg font-medium mb-3 text-center text-white">{title}</h3>}
      <div ref={qrRef} className="flex justify-center mb-3"></div>
      <div className="flex justify-center w-full">
        <Badge variant="outline" className="text-xs px-2 py-1 bg-purple-900/30 border-purple-500/30 text-purple-300">
          Scan to join
        </Badge>
      </div>
    </Card>
  );
};
