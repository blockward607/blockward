import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { InviteCodeTab } from '@/components/classroom/invite/InviteCodeTab';
import { SeatingChart } from '@/components/seating/SeatingChart';
import { TeacherGradePanel } from '@/components/grades/TeacherGradePanel';
import { useClassroomStudents } from '@/hooks/use-classroom-students';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AnnouncementStream } from "@/components/classroom/AnnouncementStream";
import { StudentAttendanceView } from '@/components/attendance/StudentAttendanceView';

type Student = ReturnType<typeof useClassroomStudents>['students'][0];

const ClassDetails = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stream");
  const navigate = useNavigate();
  const { students: classroomStudents, loading: loadingStudents } = useClassroomStudents(classroomId || '');
  const { toast } = useToast();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [isAwardingPoints, setIsAwardingPoints] = useState(false);
  const [isAwardPointsDialogOpen, setIsAwardPointsDialogOpen] = useState(false);

  // Role check (is current user teacher of this class?)
  const [isTeacher, setIsTeacher] = useState(false);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkIsTeacher() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return setIsTeacher(false);
        setSessionUserId(session.user.id);
        if (!classroom) return setIsTeacher(false);
        const { data: tProfile } = await supabase
          .from("teacher_profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .single();
        setIsTeacher(tProfile && classroom.teacher_id === tProfile.id);
      } catch { setIsTeacher(false); }
    }
    checkIsTeacher();
  }, [classroom]);

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

  const openAwardPointsDialog = (student: Student) => {
    setSelectedStudent(student);
    setPoints(0);
    setReason("");
    setIsAwardPointsDialogOpen(true);
  };

  const handleAwardPoints = async () => {
    if (!selectedStudent || points === 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a non-zero point amount.",
      });
      return;
    }

    setIsAwardingPoints(true);
    try {
      const { error: behaviorError } = await supabase.from('behavior_records').insert({
        student_id: selectedStudent.id,
        points: points,
        description: reason,
        type: points > 0 ? 'positive' : 'negative'
      });

      if (behaviorError) throw behaviorError;

      const { error: pointsError } = await supabase.rpc('increment_student_points', {
        points_to_add: points,
        student_id: selectedStudent.id,
      });

      if (pointsError) throw pointsError;

      toast({
        title: "Success",
        description: `Awarded ${points} points to ${selectedStudent.name}.`,
      });
      
      setIsAwardPointsDialogOpen(false);
    } catch (error: any) {
      console.error('Error awarding points:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to award points",
      });
    } finally {
      setIsAwardingPoints(false);
    }
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

  // Decide visible tabs for students and teachers
  const visibleTabs = isTeacher
    ? [
        { value: "stream", label: "Stream" },
        { value: "students", label: "Students" },
        { value: "assignments", label: "Assignments & Grades" },
        { value: "seating", label: "Seating Plan" },
        { value: "resources", label: "Resources" },
      ]
    : [
        { value: "stream", label: "Stream" },
        { value: "assignments", label: "Assignments & Grades" },
        { value: "seating", label: "Seating Plan" },
        { value: "attendance", label: "Attendance" },
        // Optionally: "Messages" tab in the future
      ];

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
            <TabsList className={`grid w-full mb-6 ${isTeacher ? "grid-cols-5" : "grid-cols-4"}`}>
              {visibleTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="stream" className="min-h-[200px] p-4">
              {/* Only teachers can post announcements. AnnouncementStream already enforces this. */}
              <AnnouncementStream classroomId={classroomId || ""} isTeacher={isTeacher} />
            </TabsContent>
            
            {isTeacher && (
              <TabsContent value="students" className="min-h-[200px] p-4">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white">Invite Students</h2>
                  <div className="max-w-md">
                    {classroomId && <InviteCodeTab classroomId={classroomId} />}
                  </div>
                  <div className="text-white mt-6">
                    <h3 className="text-lg font-medium mb-3">Enrolled Students</h3>
                    {loadingStudents ? (
                      <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                    ) : classroomStudents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {classroomStudents.map((student) => (
                          <Card 
                            key={student.id} 
                            className="p-3 bg-black/50 flex items-center gap-3 hover:bg-black/70 transition-colors cursor-pointer"
                            onClick={() => openAwardPointsDialog(student)}
                          >
                            <Avatar>
                              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${student.name}`} />
                              <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <p className="font-medium text-sm">{student.name}</p>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No students have joined this class yet.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
            
            <TabsContent value="assignments" className="min-h-[200px] p-4">
              {/* Teachers see grade panel, students see alternative */}
              {isTeacher ? (
                classroomId && <TeacherGradePanel classroomId={classroomId} />
              ) : (
                // For students, just show the student grades/assignment view component.
                <div>
                  {/* Student view for assignments goes here, or a message if not implemented */}
                  <div className="text-gray-300">
                    {/* If you have a StudentGradePanel, render it here */}
                    Assignment submission & grades are accessible for students here.
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="seating" className="min-h-[200px] p-4">
              {/* Seating chart visible to both */}
              {classroomId && (
                <SeatingChart classroomId={classroomId}
                  {...(!isTeacher && sessionUserId ? { highlightUserId: sessionUserId } : {})}
                />
              )}
            </TabsContent>
            
            {/* Student attendance tab only (students only) */}
            {!isTeacher && (
              <TabsContent value="attendance" className="min-h-[200px] p-4">
                {classroomId && <StudentAttendanceView classroomId={classroomId} />}
              </TabsContent>
            )}
            
            {/* Teacher attendance quick mode (panel, just a button to open attendance page for now) */}
            {isTeacher && (
              <TabsContent value="attendance" className="min-h-[200px] p-4">
                {/* Link to attendance page or just show current period (for further enhancement) */}
                <div className="flex flex-col items-center justify-center py-3">
                  <span className="text-white mb-3">Go to Attendance tab to track students!</span>
                  <Button
                    variant="outline"
                    onClick={() => window.open("/attendance", "_blank")}
                  >
                    Open Full Attendance Tracker
                  </Button>
                </div>
              </TabsContent>
            )}
            
            {/* Teachers only see "Resources" tab */}
            {isTeacher && (
              <TabsContent value="resources" className="min-h-[200px] p-4">
                <div className="text-white">Resources Content</div>
              </TabsContent>
            )}
            
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Teacher's point dialog only */}
      {isTeacher && (
        <Dialog open={isAwardPointsDialogOpen} onOpenChange={setIsAwardPointsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-[#25293A] border border-purple-500/30 shadow-[0_0_30px_rgba(147,51,234,0.4)]">
            <DialogHeader>
              <DialogTitle className="text-xl text-center text-white">Award Points to {selectedStudent?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                type="number"
                placeholder="Enter points (e.g., 5 or -5)"
                value={points === 0 ? '' : points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                className="bg-black/50 border-purple-500/30 text-white"
              />
              <Textarea
                placeholder="Reason for awarding points (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-black/50 border-purple-500/30 text-white min-h-[100px]"
              />
            </div>
            <DialogFooter className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsAwardPointsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAwardPoints} 
                disabled={isAwardingPoints}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isAwardingPoints ? "Awarding..." : "Award Points"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClassDetails;
