
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, Award, Plus, Settings, 
  Upload, Download, Send, FileSpreadsheet,
  Database, Key, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { StudentSelect } from "@/components/nft/StudentSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export const TeacherToolbox = () => {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [points, setPoints] = useState("10");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedStudentFile, setSelectedStudentFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importType, setImportType] = useState("students");

  const handleSendPoints = async () => {
    if (!selectedStudent || !points) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a student and enter points amount"
      });
      return;
    }

    try {
      // Add points to student
      const { error } = await supabase.rpc(
        'increment_student_points',
        { student_id: selectedStudent, points_to_add: parseInt(points) }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: `Sent ${points} points to the selected student`
      });
      setSelectedStudent("");
      setPoints("10");
    } catch (error) {
      console.error('Error sending points:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send points"
      });
    }
  };

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

  const handleImportStudents = async () => {
    if (!selectedStudentFile) {
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
          
          // Import student data
          for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue;
            
            const values = rows[i].split(',').map(v => v.trim());
            const studentData: Record<string, any> = {};
            
            headers.forEach((header, index) => {
              studentData[header.toLowerCase()] = values[index];
            });
            
            if (studentData.name) {
              // Get current session
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) continue;
              
              // Get teacher profile to link students to teacher's classrooms
              const { data: teacherProfile } = await supabase
                .from('teacher_profiles')
                .select('id')
                .eq('user_id', session.user.id)
                .single();
                
              if (!teacherProfile) continue;
              
              // Create student
              const { data: newStudent, error } = await supabase
                .from('students')
                .insert({
                  name: studentData.name,
                  school: studentData.school || '',
                  points: studentData.points ? parseInt(studentData.points) : 0
                })
                .select()
                .single();
                
              if (error) {
                console.error('Error importing student:', error);
                continue;
              }
              
              // Get teacher's classrooms
              const { data: classrooms } = await supabase
                .from('classrooms')
                .select('id')
                .eq('teacher_id', teacherProfile.id)
                .limit(1);
                
              if (classrooms && classrooms.length > 0) {
                // Add student to first classroom
                const { error: linkError } = await supabase
                  .from('classroom_students')
                  .insert({
                    classroom_id: classrooms[0].id,
                    student_id: newStudent.id
                  });
                  
                if (linkError) console.error('Error linking student to classroom:', linkError);
              }
            }
          }
          
          toast({
            title: "Success",
            description: "Students imported and added to your classroom"
          });
        }
      };
      
      reader.readAsText(selectedStudentFile);
    } catch (error) {
      console.error('Error importing students:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to import students"
      });
    } finally {
      setImporting(false);
      setSelectedStudentFile(null);
    }
  };

  return (
    <Card className="p-6 glass-card">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold gradient-text">Teacher Toolbox</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className="p-4 hover:bg-purple-900/10 transition-all border border-purple-500/20 backdrop-blur-sm">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-purple-600/20">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-semibold">Manage Students</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">Add, remove, or manage students in your classes</p>
                <Link to="/students" className="mt-auto">
                  <Button className="w-full" variant="outline">
                    <Users className="w-4 h-4 mr-2" /> 
                    View Students
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className="p-4 hover:bg-purple-900/10 transition-all border border-purple-500/20 backdrop-blur-sm">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-purple-600/20">
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-semibold">Issue NFT Awards</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">Create and distribute achievement NFTs to students</p>
                <Link to="/rewards" className="mt-auto">
                  <Button className="w-full" variant="outline">
                    <Award className="w-4 h-4 mr-2" /> 
                    Create NFTs
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className="p-4 hover:bg-purple-900/10 transition-all border border-purple-500/20 backdrop-blur-sm">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-purple-600/20">
                    <Plus className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-semibold">Send Points</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">Award behavior points to students</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <Send className="w-4 h-4 mr-2" /> 
                      Send Points
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Send Points to Student</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="student">Select Student</Label>
                        <StudentSelect
                          value={selectedStudent}
                          onChange={setSelectedStudent}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="points">Points Amount</Label>
                        <Input
                          id="points"
                          type="number"
                          value={points}
                          onChange={(e) => setPoints(e.target.value)}
                          min="1"
                          className="glass-input"
                        />
                      </div>
                    </div>
                    <Button onClick={handleSendPoints} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">Send Points</Button>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className="p-4 hover:bg-purple-900/10 transition-all border border-purple-500/20 backdrop-blur-sm">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-purple-600/20">
                    <Upload className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-semibold">Import Data</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">Import student data from CSV or Excel files</p>
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
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              </div>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className="p-4 hover:bg-purple-900/10 transition-all border border-purple-500/20 backdrop-blur-sm">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-purple-600/20">
                    <Download className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-semibold">Export Reports</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">Export grades, attendance, and behavior data</p>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" /> 
                  Export
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Card className="p-4 hover:bg-purple-900/10 transition-all border border-purple-500/20 backdrop-blur-sm">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-purple-600/20">
                    <Key className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="font-semibold">Class Codes</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">Generate and manage unique class join codes</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <Key className="w-4 h-4 mr-2" /> 
                      View Codes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Your Class Codes</DialogTitle>
                      <DialogDescription>
                        Share these codes with students to join your classes
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="rounded-md bg-black/20 p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="mr-3 rounded-full bg-purple-800/30 p-2">
                              <Key className="h-4 w-4 text-purple-300" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Math Class</p>
                              <p className="text-xs text-gray-400">Active</p>
                            </div>
                          </div>
                          <div className="font-mono text-lg font-bold text-purple-300">
                            ABX45Z
                          </div>
                        </div>
                      </div>
                      
                      <div className="rounded-md bg-black/20 p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="mr-3 rounded-full bg-purple-800/30 p-2">
                              <Key className="h-4 w-4 text-purple-300" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Science Class</p>
                              <p className="text-xs text-gray-400">Active</p>
                            </div>
                          </div>
                          <div className="font-mono text-lg font-bold text-purple-300">
                            PWD78Q
                          </div>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4">
                        Generate New Code
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </Card>
  );
};
