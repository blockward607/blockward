import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClassroomHeader } from '@/components/classrooms/ClassroomHeader';
import { ClassroomStream } from '@/components/classrooms/ClassroomStream';
import { ClassroomStudents } from '@/components/classrooms/ClassroomStudents';
import { ClassroomResources } from '@/components/classrooms/ClassroomResources';
import { supabase } from '@/integrations/supabase/client';
import { Link } from "react-router-dom";

const ClassDetails = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [classroom, setClassroom] = useState(null);
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
    return <div>Loading classroom details...</div>;
  }

  if (!classroom) {
    return <div>Classroom not found.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <ClassroomHeader classroom={classroom} />

      <Card className="w-full mt-8 bg-black/40 border-purple-500/30">
        <CardContent className="p-4">
          <Tabs defaultValue="stream" className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="stream">Stream</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <Link to={`/class/${classroomId}/grades`} className="px-4 py-2 rounded-md hover:bg-purple-800/40 text-white">
                Grades
              </Link>
            </TabsList>
            <TabsContent value="stream">
              <ClassroomStream classroomId={classroomId} />
            </TabsContent>
            <TabsContent value="assignments">
              <div>Assignments Content</div>
            </TabsContent>
            <TabsContent value="students">
              <ClassroomStudents classroomId={classroomId} />
            </TabsContent>
            <TabsContent value="resources">
              <ClassroomResources classroomId={classroomId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassDetails;
