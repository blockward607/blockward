
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRScanTab } from "./QRScanTab";
import CodeEntryTab from "./CodeEntryTab";
import { ImportOptions } from "./ImportOptions";
import { GoogleClassroomImportDialog } from "./GoogleClassroomImportDialog";
import { useJoinClassContext } from "./JoinClassContext";

export const JoinClassSection = () => {
  const [activeTab, setActiveTab] = useState("code");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const { scannerOpen, setScannerOpen, autoJoinInProgress } = useJoinClassContext();
  
  // If auto-join is in progress, show the code tab which has loading state
  if (autoJoinInProgress) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="glass-card p-6">
          <h2 className="text-2xl font-bold text-center mb-4 gradient-text">Join Class</h2>
          <CodeEntryTab />
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="glass-card p-6">
        <h2 className="text-2xl font-bold text-center mb-4 gradient-text">Join Class</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="code">Invitation Code</TabsTrigger>
            <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="code">
            <CodeEntryTab />
          </TabsContent>
          
          <TabsContent value="scan">
            <QRScanTab
              open={scannerOpen}
              onOpenChange={setScannerOpen}
              onClose={() => setScannerOpen(false)}
            />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 pt-4 border-t border-gray-800">
          <ImportOptions onImport={() => setShowImportDialog(true)} />
        </div>
      </Card>
      
      <GoogleClassroomImportDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog} 
      />
    </div>
  );
};
