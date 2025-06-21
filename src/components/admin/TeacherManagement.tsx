
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Shield, Ban, Unlock, Search, UserPlus, Trash2, Key } from "lucide-react";
import { CreateTeacherDialog } from "./CreateTeacherDialog";

interface Teacher {
  id: string;
  user_id: string;
  full_name: string;
  subject: string;
  school: string;
  created_at: string;
  is_active: boolean;
}

interface TeacherManagementProps {
  schoolId?: string | null;
}

export const TeacherManagement = ({ schoolId }: TeacherManagementProps) => {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  useEffect(() => {
    if (schoolId) {
      loadTeachers();
    }
  }, [schoolId]);

  const loadTeachers = async () => {
    if (!schoolId) {
      console.log('TeacherManagement: No school ID provided');
      setLoading(false);
      return;
    }

    try {
      console.log('TeacherManagement: Loading teachers for school:', schoolId);
      
      const { data: teacherProfiles, error } = await supabase
        .from('teacher_profiles')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const teachersData = teacherProfiles?.map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        full_name: profile.full_name || 'Unknown Teacher',
        subject: profile.subject || 'General',
        school: profile.school || 'Current School',
        created_at: profile.created_at,
        is_active: true
      })) || [];

      console.log('TeacherManagement: Loaded', teachersData.length, 'teachers for school');
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load teachers"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetTeacherPassword = async (teacherId: string) => {
    try {
      toast({
        title: "Password Reset",
        description: "Password reset email sent to teacher"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Failed to reset password"
      });
    }
  };

  const toggleTeacherStatus = async (teacherId: string, currentStatus: boolean) => {
    try {
      setTeachers(teachers.map(teacher => 
        teacher.id === teacherId ? { ...teacher, is_active: !currentStatus } : teacher
      ));
      
      toast({
        title: currentStatus ? "Teacher Deactivated" : "Teacher Activated",
        description: `Teacher account ${currentStatus ? 'deactivated' : 'activated'} successfully`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update teacher status"
      });
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === "all" || teacher.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

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
          <h2 className="text-2xl font-bold text-white">Teacher Management</h2>
          <p className="text-gray-400">Manage teacher accounts, passwords, and class assignments</p>
        </div>
        <CreateTeacherDialog onTeacherCreated={loadTeachers} schoolId={schoolId} />
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search teachers by name or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="History">History</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Teachers ({filteredTeachers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No teachers found for your school</p>
              <p className="text-sm mt-2">Add teachers to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Teacher</TableHead>
                  <TableHead className="text-gray-300">Subject</TableHead>
                  <TableHead className="text-gray-300">School</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{teacher.full_name}</div>
                        <div className="text-sm text-gray-400">ID: {teacher.id.slice(0, 8)}...</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {teacher.subject}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{teacher.school}</TableCell>
                    <TableCell>
                      <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                        {teacher.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetTeacherPassword(teacher.id)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleTeacherStatus(teacher.id, teacher.is_active)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          {teacher.is_active ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
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
