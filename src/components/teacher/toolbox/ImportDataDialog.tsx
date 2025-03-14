
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Database, FileSpreadsheet, FileText, Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ImportDataDialog = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importType, setImportType] = useState("students");

  const handleImportData = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file to import"
      });
      return;
    }

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target && e.target.result) {
          const content = e.target.result as string;
          
          // Parse CSV data
          const rows = content.split('\n');
          const headers = rows[0].split(',').map(h => h.trim());
          
          if (importType === "students") {
            // Import student data
            for (let i = 1; i < rows.length; i++) {
              if (!rows[i].trim()) continue;
              
              const values = rows[i].split(',').map(v => v.trim());
              const studentData: Record<string, any> = {};
              
              headers.forEach((header, index) => {
                studentData[header.toLowerCase()] = values[index];
              });
              
              if (studentData.name) {
                const { error } = await supabase
                  .from('students')
                  .insert({
                    name: studentData.name,
                    school: studentData.school || '',
                    points: studentData.points ? parseInt(studentData.points) : 0
                  });
                  
                if (error) console.error('Error importing student:', error);
              }
            }
            
            toast({
              title: "Success",
              description: "Student data imported successfully"
            });
          } else if (importType === "assignments") {
            // Import assignment data
            for (let i = 1; i < rows.length; i++) {
              if (!rows[i].trim()) continue;
              
              const values = rows[i].split(',').map(v => v.trim());
              const assignmentData: Record<string, any> = {};
              
              headers.forEach((header, index) => {
                assignmentData[header.toLowerCase()] = values[index];
              });
              
              if (assignmentData.title) {
                const { data: classrooms } = await supabase
                  .from('classrooms')
                  .select('id')
                  .limit(1);
                  
                const classroomId = classrooms && classrooms.length > 0 ? classrooms[0].id : null;
                
                if (classroomId) {
                  const { error } = await supabase
                    .from('assignments')
                    .insert({
                      classroom_id: classroomId,
                      title: assignmentData.title,
                      description: assignmentData.description || '',
                      points_possible: assignmentData.points ? parseInt(assignmentData.points) : 100
                    });
                    
                  if (error) console.error('Error importing assignment:', error);
                }
              }
            }
            
            toast({
              title: "Success",
              description: "Assignment data imported successfully"
            });
          }
        }
      };
      
      reader.readAsText(selectedFile);
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to import data"
      });
    } finally {
      setImporting(false);
      setSelectedFile(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Upload className="w-4 h-4 mr-2" /> 
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Upload CSV files to import students, assignments, or grades.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="students" onValueChange={(value) => setImportType(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="students">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <FileText className="w-4 h-4 mr-2" />
              Assignments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="students" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Upload Students CSV File</Label>
              <p className="text-xs text-gray-500">
                Format: Name,School,Points
              </p>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="glass-input"
              />
            </div>
            <Button 
              onClick={handleImportData} 
              disabled={importing || !selectedFile}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {importing ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Import Students
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Upload Assignments CSV File</Label>
              <p className="text-xs text-gray-500">
                Format: Title,Description,Points
              </p>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="glass-input"
              />
            </div>
            <Button 
              onClick={handleImportData} 
              disabled={importing || !selectedFile}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {importing ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Import Assignments
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
