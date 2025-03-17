
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRScanTab } from "./QRScanTab";
import { CodeEntryTab } from "./CodeEntryTab";
import { JoinClassProvider } from "./JoinClassContext";
import { Card } from "@/components/ui/card";

export const JoinClassSection = () => {
  return (
    <Card className="p-4 bg-black/40 border border-purple-500/30">
      <h2 className="text-xl font-semibold mb-4 text-white">Join a Class</h2>
      <JoinClassProvider>
        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/60 border border-purple-500/30">
            <TabsTrigger value="code">Enter Code</TabsTrigger>
            <TabsTrigger value="scan">Scan QR</TabsTrigger>
          </TabsList>
          
          <TabsContent value="code" className="mt-2">
            <CodeEntryTab />
            <p className="text-xs text-gray-400 mt-2">
              Enter the invitation code provided by your teacher.
            </p>
          </TabsContent>
          
          <TabsContent value="scan" className="mt-2">
            <QRScanTab />
          </TabsContent>
        </Tabs>
      </JoinClassProvider>
    </Card>
  );
};
