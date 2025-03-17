
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRScanTab } from "./QRScanTab";
import { CodeEntryTab } from "./CodeEntryTab";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { useJoinClassContext } from "./JoinClassContext";

export const JoinClassSection = () => {
  // Determine initial tab based on whether there's a code in the URL
  const getInitialTab = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code') ? 'code' : 'code';
  };

  return (
    <Card className="p-4 bg-black/40 border border-purple-500/30">
      <h2 className="text-xl font-semibold mb-4 text-white">Join a Class</h2>
      <Tabs defaultValue={getInitialTab()} className="w-full">
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
