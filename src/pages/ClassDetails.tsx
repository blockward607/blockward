
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { InviteCodeTab } from '@/components/classroom/invite/InviteCodeTab';

const ClassDetails = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stream");
  const navigate = useNavigate();

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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleBack = () => {
    navigate('/classes');
  };

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
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{classroom.name}</h1>
          {classroom.description && <p className="text-gray-400 mt-2">{classroom.description}</p>}
        </div>
      </div>

      <Card className="w-full mt-8 bg-black/40 border-purple-500/30">
        <CardContent className="p-4">
          <Tabs defaultValue="stream" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="stream">Stream</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="grades">Grades</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stream" className="min-h-[200px] p-4">
              <div className="text-white">Stream Content</div>
            </TabsContent>
            
            <TabsContent value="assignments" className="min-h-[200px] p-4">
              <div className="text-white">Assignments Content</div>
            </TabsContent>
            
            <TabsContent value="students" className="min-h-[200px] p-4">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">Invite Students</h2>
                <div className="max-w-md">
                  {classroomId && <InviteCodeTab classroomId={classroomId} />}
                </div>
                <div className="text-white mt-6">
                  <h3 className="text-lg font-medium mb-3">Students</h3>
                  <p className="text-gray-400">Student list will appear here.</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="min-h-[200px] p-4">
              <div className="text-white">Resources Content</div>
            </TabsContent>
            
            <TabsContent value="grades" className="min-h-[200px] p-4">
              <div className="text-white">Grades Content</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassDetails;
