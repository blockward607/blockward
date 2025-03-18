
import { Card } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  value: string;
  title?: string;
  className?: string;
}

export const QRCodeDisplay = ({ value, title, className = "" }: QRCodeDisplayProps) => {
  return (
    <Card className={`p-4 bg-white rounded-md flex flex-col items-center ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-black mb-2">{title}</h3>
      )}
      <QRCodeSVG 
        value={value}
        size={200}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"L"}
        includeMargin={false}
      />
      <p className="text-xs text-center text-black mt-2">
        Scan this QR code to join the class
      </p>
    </Card>
  );
};
