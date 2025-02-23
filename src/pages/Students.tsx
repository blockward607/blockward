
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface Student {
  id: string;
  name: string;
  points: number;
  created_at: string;
  school?: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Card className="p-6">
          <div className="flex justify-center items-center h-40">
            <p>Loading students...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-purple-600/20">
          <Users className="w-6 h-6 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold gradient-text">Students</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => (
          <Card key={student.id} className="p-4 hover:bg-purple-900/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                {student.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{student.name}</p>
                <p className="text-sm text-gray-400">{student.points} points</p>
                {student.school && (
                  <p className="text-sm text-gray-400">{student.school}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Students;
