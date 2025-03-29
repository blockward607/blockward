
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRScanTab } from "./QRScanTab";
import CodeEntryTab from "./CodeEntryTab";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { codeExtractor } from "@/utils/codeExtractor";

export const JoinClassSection = () => {
  const [activeTab, setActiveTab] = useState('code');
  const location = useLocation();
  
  // Check if we have a code in the URL that could be scanned via QR
  useEffect(() => {
    const checkForQRCode = () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code') || searchParams.get('join');
      
      // If code comes from a QR scan (usually contains URL or complex format), show scan tab
      if (code && (code.includes('://') || code.length > 20)) {
        const extractedCode = codeExtractor.extractJoinCode(code);
        if (extractedCode) {
          setActiveTab('scan');
        }
      }
    };
    
    checkForQRCode();
  }, [location]);

  return (
    <Card className="p-4 bg-black/40 border border-purple-500/30">
      <h2 className="text-xl font-semibold mb-4 text-white">Join a Class</h2>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/60 border border-purple-500/30">
          <TabsTrigger value="code">Enter Code</TabsTrigger>
          <TabsTrigger value="scan">Scan QR</TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="mt-2">
          <CodeEntryTab />
        </TabsContent>
        
        <TabsContent value="scan" className="mt-2">
          <QRScanTab />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
