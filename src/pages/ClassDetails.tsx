
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const ClassDetails = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('classrooms')
          .select('*')
          .eq('id', classroomId)
          .single();

        if (error) {
          console.error("Error fetching classroom:", error);
        }

        setClassroom(data);
      } catch (error) {
        console.error("Error fetching classroom:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassroom();
  }, [classroomId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!classroom) {
    return <div className="container mx-auto py-8 px-4">Classroom not found.</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{classroom.name}</h1>
        {classroom.description && <p className="text-gray-400 mt-2">{classroom.description}</p>}
      </div>

      <Card className="w-full mt-8 bg-black/40 border-purple-500/30">
        <CardContent className="p-4">
          <Tabs defaultValue="stream" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="stream">Stream</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <Link to={`/class/${classroomId}/grades`} className="px-4 py-2 rounded-md hover:bg-purple-800/40 text-white text-center">
                Grades
              </Link>
            </TabsList>
            <TabsContent value="stream">
              <div>Stream Content</div>
            </TabsContent>
            <TabsContent value="assignments">
              <div>Assignments Content</div>
            </TabsContent>
            <TabsContent value="students">
              <div>Students Content</div>
            </TabsContent>
            <TabsContent value="resources">
              <div>Resources Content</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassDetails;
