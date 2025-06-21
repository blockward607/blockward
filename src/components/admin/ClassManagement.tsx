
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { School, Users, Plus, Edit, Trash2, Code, Eye } from "lucide-react";

interface Classroom {
  id: string;
  name: string;
  description: string;
  section: string;
  teacher_id: string;
  school_id: string;
  created_at: string;
  teacher_name?: string;
  student_count?: number;
}

interface Teacher {
  id: string;
  user_id: string;
  full_name: string;
}

interface ClassManagementProps {
  schoolId?: string | null;
}

export const ClassManagement = ({ schoolId }: ClassManagementProps) => {
  const { toast } = useToast();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",  
    section: "",
    teacher_id: ""
  });

  useEffect(() => {
    if (schoolId) {
      loadData();
    }
  }, [schoolId]);

  const loadData = async () => {
    if (!schoolId) {
      console.log('ClassManagement: No school ID provided');
      setLoading(false);
      return;
    }

    try {
      console.log('ClassManagement: Loading data for school:', schoolId);
      
      // Load classrooms with teacher info and student counts for this school only
      const { data: classroomsData, error: classroomsError } = await supabase
        .from('classrooms')
        .select(`
          *,
          teacher_profiles!inner(full_name),
          classroom_students(count)
        `)
        .eq('school_id', schoolId);

      if (classroomsError) throw classroomsError;

      // Load teachers for this school only
      const { data: teachersData, error: teachersError } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('school_id', schoolId);

      if (teachersError) throw teachersError;

      setClassrooms(classroomsData?.map(classroom => ({
        ...classroom,
        teacher_name: classroom.teacher_profiles?.full_name,
        student_count: classroom.classroom_students?.length || 0
      })) || []);
      
      setTeachers(teachersData || []);
      console.log('ClassManagement: Loaded', classroomsData?.length || 0, 'classrooms and', teachersData?.length || 0, 'teachers');
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classroom data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No school ID available"
      });
      return;
    }
    
    try {
      const dataToSubmit = {
        ...formData,
        school_id: schoolId
      };

      if (editingClass) {
        const { error } = await supabase
          .from('classrooms')
          .update(dataToSubmit)
          .eq('id', editingClass.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Classroom updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('classrooms')
          .insert([dataToSubmit]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Classroom created successfully"
        });
      }

      setIsCreateOpen(false);
      setEditingClass(null);
      setFormData({ name: "", description: "", section: "", teacher_id: "" });
      loadData();
    } catch (error: any) {
      console.error('Error saving classroom:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save classroom"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this classroom?')) return;

    try {
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Classroom deleted successfully"
      });
      
      loadData();
    } catch (error: any) {
      console.error('Error deleting classroom:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete classroom"
      });
    }
  };

  const generateClassCode = async (classroomId: string) => {
    try {
      const { data, error } = await supabase.rpc('create_classroom_code', {
        p_classroom_id: classroomId,
        p_created_by: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Class code generated: ${data}`
      });
    } catch (error: any) {
      console.error('Error generating class code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate class code"
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

  if (!schoolId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-gray-400">
          <p>No school assigned to admin account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Class Management</h2>
          <p className="text-gray-400">Create and manage classrooms, assign teachers, and generate class codes</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingClass ? 'Edit Classroom' : 'Create New Classroom'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingClass ? 'Update classroom details' : 'Add a new classroom to your school'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">Class Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Mathematics 101"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="section" className="text-gray-300">Section</Label>
                <Input
                  id="section"
                  value={formData.section}
                  onChange={(e) => setFormData({...formData, section: e.target.value})}
                  placeholder="e.g., A, B, Advanced"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="teacher" className="text-gray-300">Assign Teacher</Label>
                <Select value={formData.teacher_id} onValueChange={(value) => setFormData({...formData, teacher_id: value})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.user_id} className="text-white">
                        {teacher.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the class"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingClass(null);
                    setFormData({ name: "", description: "", section: "", teacher_id: "" });
                  }}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingClass ? 'Update' : 'Create'} Class
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <School className="w-5 h-5" />
            Classrooms ({classrooms.length})
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage all classrooms in your school
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classrooms.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <School className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No classrooms created yet</p>
              <p className="text-sm mt-2">Create your first classroom to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Class Name</TableHead>
                  <TableHead className="text-gray-300">Section</TableHead>
                  <TableHead className="text-gray-300">Teacher</TableHead>
                  <TableHead className="text-gray-300">Students</TableHead>
                  <TableHead className="text-gray-300">Created</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classrooms.map((classroom) => (
                  <TableRow key={classroom.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{classroom.name}</div>
                        {classroom.description && (
                          <div className="text-sm text-gray-400">{classroom.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {classroom.section ? (
                        <Badge variant="secondary">{classroom.section}</Badge>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {classroom.teacher_name || 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-300">
                        <Users className="w-4 h-4" />
                        {classroom.student_count}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(classroom.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateClassCode(classroom.id)}
                          className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                        >
                          <Code className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingClass(classroom);
                            setFormData({
                              name: classroom.name,
                              description: classroom.description || "",
                              section: classroom.section || "",
                              teacher_id: classroom.teacher_id || ""
                            });
                            setIsCreateOpen(true);
                          }}
                          className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(classroom.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
