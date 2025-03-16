
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JoinClassForm } from "./JoinClassForm";
import { QRCodeOption } from "./QRCodeOption";

export const JoinClassSection = () => {
  const [invitationCode, setInvitationCode] = useState("");
  
  // Parse code from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setInvitationCode(codeParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <Card className="p-6 bg-purple-900/20 backdrop-blur-md border border-purple-500/30 mb-6">
      <h3 className="text-lg font-semibold mb-3">Join a Class</h3>
      <p className="text-sm text-gray-300 mb-4">
        Enter the invitation code provided by your teacher or scan a QR code to join their class.
      </p>
      
      <Tabs defaultValue="code">
        <TabsList className="mb-4 bg-black/50">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="qr">QR Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="code">
          <JoinClassForm 
            invitationCode={invitationCode} 
            setInvitationCode={setInvitationCode} 
          />
        </TabsContent>
        
        <TabsContent value="qr">
          <QRCodeOption onCodeScanned={setInvitationCode} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
