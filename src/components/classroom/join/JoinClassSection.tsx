
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRScanTab } from "./QRScanTab";
import CodeEntryTab from "./CodeEntryTab";
import { useJoinClassContext } from "./JoinClassContext";
import { Loader2 } from "lucide-react";

interface JoinClassSectionProps {
  initialCode?: string;
}

export const JoinClassSection = ({ initialCode }: JoinClassSectionProps) => {
  const [activeTab, setActiveTab] = useState("code");
  
  const { 
    scannerOpen, 
    setScannerOpen, 
    autoJoinInProgress, 
    setClassroomCode,
    joinClassWithCode
  } = useJoinClassContext();
  
  // When initialCode is provided, set it in the context
  useEffect(() => {
    if (initialCode) {
      console.log("Initial code provided:", initialCode);
      setClassroomCode(initialCode);
      
      // Auto-join with the code if provided
      const autoJoin = async () => {
        try {
          await joinClassWithCode(initialCode);
        } catch (error) {
          console.error("Error auto-joining with code:", error);
        }
      };
      
      autoJoin();
    }
  }, [initialCode, setClassroomCode, joinClassWithCode]);
  
  // When activating the scan tab, automatically open the scanner
  useEffect(() => {
    if (activeTab === "scan") {
      setScannerOpen(true);
    } else {
      setScannerOpen(false);
    }
  }, [activeTab, setScannerOpen]);
  
  // If auto-join is in progress, show loading state
  if (autoJoinInProgress) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="glass-card p-6">
          <h2 className="text-2xl font-bold text-center mb-4 gradient-text">Join Class</h2>
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
            <p className="text-center text-gray-300">Joining class...</p>
          </div>
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
              onClose={() => {
                setScannerOpen(false);
                setActiveTab("code");
              }}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
