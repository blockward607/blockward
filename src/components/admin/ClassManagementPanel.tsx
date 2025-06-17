
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  School, 
  Plus, 
  Search, 
  MoreVertical,
  Users,
  Settings,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Classroom {
  id: string;
  name: string;
  description: string;
  section: string;
  teacher_id: string;
  created_at: string;
  student_count?: number;
}

export const ClassManagementPanel = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select(`
          *,
          classroom_students(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const classroomsWithCount = data?.map(classroom => ({
        ...classroom,
        student_count: classroom.classroom_students?.[0]?.count || 0
      })) || [];

      setClassrooms(classroomsWithCount);
    } catch (error) {
      console.error('Error loading classrooms:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classrooms"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.section?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Class Management</h2>
          <p className="text-gray-400">Manage classrooms and assignments</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Class
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center">
              <School className="w-5 h-5 mr-2" />
              Classes ({filteredClassrooms.length})
            </CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-2 text-gray-400">Loading classes...</p>
            </div>
          ) : filteredClassrooms.length === 0 ? (
            <div className="text-center py-8">
              <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No classes found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredClassrooms.map((classroom) => (
                <div key={classroom.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <School className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{classroom.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="bg-purple-600 text-white">
                          <Users className="w-3 h-3 mr-1" />
                          {classroom.student_count} students
                        </Badge>
                        {classroom.section && (
                          <Badge variant="outline" className="border-gray-500 text-gray-300">
                            {classroom.section}
                          </Badge>
                        )}
                      </div>
                      {classroom.description && (
                        <p className="text-gray-400 text-sm mt-1">{classroom.description}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-700">
                      <DropdownMenuItem className="text-white hover:bg-gray-700">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Class
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-gray-700">
                        <Users className="w-4 h-4 mr-2" />
                        View Students
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Class
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
