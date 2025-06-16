
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Settings, School } from "lucide-react";

interface Teacher {
  id: string;
  full_name: string;
  user_id: string;
  assignments: Array<{
    id: string;
    assignment_type: string;
    classrooms: {
      id: string;
      name: string;
    };
  }>;
}

interface Classroom {
  id: string;
  name: string;
  description: string;
}

export const TeacherManagement = () => {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [assignmentType, setAssignmentType] = useState<string>("subject_teacher");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load teachers with their assignments
      const { data: teachersData } = await supabase
        .from('teacher_profiles')
        .select(`
          id,
          full_name,
          user_id,
          teacher_class_assignments (
            id,
            assignment_type,
            classrooms (
              id,
              name
            )
          )
        `);

      // Load classrooms
      const { data: classroomsData } = await supabase
        .from('classrooms')
        .select('id, name, description');

      // Transform the data to match our Teacher interface
      const transformedTeachers = (teachersData || []).map(teacher => ({
        id: teacher.id,
        full_name: teacher.full_name,
        user_id: teacher.user_id,
        assignments: teacher.teacher_class_assignments || []
      }));

      setTeachers(transformedTeachers);
      setClassrooms(classroomsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load teacher and classroom data"
      });
    } finally {
      setLoading(false);
    }
  };

  const assignTeacherToClassroom = async () => {
    if (!selectedTeacher || !selectedClassroom) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both a teacher and a classroom"
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('assign_teacher_to_classroom', {
        p_teacher_id: selectedTeacher,
        p_classroom_id: selectedClassroom,
        p_assignment_type: assignmentType
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Teacher assigned to classroom successfully"
      });

      loadData();
      setSelectedTeacher("");
      setSelectedClassroom("");
    } catch (error: any) {
      console.error('Error assigning teacher:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to assign teacher"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Teacher Management</h2>
          <p className="text-gray-400">Manage teacher assignments to classes and homerooms</p>
        </div>
      </div>

      {/* Assignment Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assign Teacher to Classroom
          </CardTitle>
          <CardDescription className="text-gray-400">
            Select a teacher and classroom to create an assignment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-200">Teacher</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.full_name || `Teacher ${teacher.id.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-200">Classroom</Label>
              <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-200">Assignment Type</Label>
              <Select value={assignmentType} onValueChange={setAssignmentType}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subject_teacher">Subject Teacher</SelectItem>
                  <SelectItem value="form_tutor">Form Tutor</SelectItem>
                  <SelectItem value="assistant">Teaching Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={assignTeacherToClassroom}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Assign Teacher
          </Button>
        </CardContent>
      </Card>

      {/* Teachers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teachers.map((teacher) => (
          <motion.div
            key={teacher.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {teacher.full_name || `Teacher ${teacher.id.slice(0, 8)}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Assignments:</h4>
                  {teacher.assignments && teacher.assignments.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {teacher.assignments.map((assignment: any, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-purple-600/20 text-purple-300">
                          {assignment.classrooms?.name} ({assignment.assignment_type})
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No assignments yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
