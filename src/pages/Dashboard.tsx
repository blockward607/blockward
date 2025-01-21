import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Student = Database['public']['Tables']['students']['Row'];

const Dashboard = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-[#1A1F2C] to-black text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
        </div>

        <Card className="p-6 glass-card">
          <h2 className="text-2xl font-semibold mb-6 gradient-text">Student List</h2>
          {loading ? (
            <p className="text-center">Loading students...</p>
          ) : (
            <div className="grid gap-4">
              {students.length === 0 ? (
                <p className="text-center text-gray-400">No students found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map((student) => (
                    <Card key={student.id} className="p-4 glass-card">
                      <h3 className="text-lg font-semibold">{student.name}</h3>
                      <p className="text-sm text-gray-400">Points: {student.points || 0}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;