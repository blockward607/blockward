
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRScanTab } from "./QRScanTab";
import { CodeEntryTab } from "./CodeEntryTab";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useJoinClassContext } from "./JoinClassContext";

export const JoinClassSection = () => {
  const [activeTab, setActiveTab] = useState('code');
  const { invitationCode } = useJoinClassContext();

  // Determine initial tab based on whether there's a code in the URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    setActiveTab(codeFromUrl ? 'code' : 'code'); // Always default to code tab for now
    console.log("JoinClassSection: Initial tab set to", activeTab);
  }, []);

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
