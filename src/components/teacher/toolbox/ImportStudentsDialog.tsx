
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader } from "lucide-react";

export const ImportStudentsDialog = () => {
  const { toast } = useToast();
  const [selectedStudentFile, setSelectedStudentFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

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
    <div className="space-y-2">
      <Label>Upload Students CSV File</Label>
      <p className="text-xs text-gray-500">
        Format: Name,School,Points
      </p>
      <Input
        type="file"
        accept=".csv"
        onChange={(e) => setSelectedStudentFile(e.target.files?.[0] || null)}
        className="glass-input"
      />
      <Button 
        onClick={handleImportStudents} 
        disabled={importing || !selectedStudentFile}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
      >
        {importing ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Import Students
          </>
        )}
      </Button>
    </div>
  );
};
