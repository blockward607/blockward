
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { motion } from "framer-motion";
import { ArrowLeft, School, Users, Award, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

// Mock data for demo
const demoClassrooms = [
  {
    id: "demo-class-1",
    name: "Mathematics 101",
    description: "Introductory mathematics class covering algebra and geometry",
    teacher_id: "demo-teacher",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    students_count: 24
  },
  {
    id: "demo-class-2",
    name: "Science Lab",
    description: "Hands-on science experiments and theory",
    teacher_id: "demo-teacher",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    students_count: 18
  }
];

const ViewTeacherDashboard = () => {
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("classroom");
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold gradient-text mb-2">Explore Blockward Features</h2>
          <p className="text-gray-300">
            Discover what Blockward can offer for your educational experience
          </p>
        </div>
        
        <Tabs 
          defaultValue="classroom" 
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-8 bg-purple-900/20 p-1 rounded-lg">
            <TabsTrigger 
              value="classroom" 
              className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
            >
              <School className="w-4 h-4 mr-2" />
              Classrooms
            </TabsTrigger>
            <TabsTrigger 
              value="students" 
              className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Student Management
            </TabsTrigger>
            <TabsTrigger 
              value="rewards" 
              className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
            >
              <Award className="w-4 h-4 mr-2" />
              NFT Rewards
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="data-[state=active]:bg-purple-800 data-[state=active]:text-white"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Learning Progress
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="classroom" className="space-y-4">
            <Card className="p-4 glass-card">
              <h3 className="text-lg font-semibold mb-2 gradient-text">Virtual Classrooms</h3>
              <p className="text-gray-300 mb-4">Create and manage digital classrooms with powerful tools for assignments, attendance tracking, and more.</p>
              
              <DashboardHeader
                userName="Demo Teacher"
              />
              
              <TeacherDashboard 
                classrooms={demoClassrooms}
                selectedClassroom={selectedClassroom}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="students" className="space-y-4">
            <Card className="p-6 glass-card">
              <h3 className="text-lg font-semibold mb-2 gradient-text">Student Management</h3>
              <p className="text-gray-300 mb-4">Comprehensive tools for tracking student progress, behavior management, and personalized learning paths.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card className="p-4 bg-purple-900/20 hover:bg-purple-900/30 transition-all">
                  <h4 className="font-medium mb-2">Attendance Tracking</h4>
                  <p className="text-sm text-gray-400">Easily track and report student attendance with real-time updates.</p>
                </Card>
                
                <Card className="p-4 bg-purple-900/20 hover:bg-purple-900/30 transition-all">
                  <h4 className="font-medium mb-2">Behavior Management</h4>
                  <p className="text-sm text-gray-400">Track and reinforce positive behaviors with built-in blockchain rewards.</p>
                </Card>
                
                <Card className="p-4 bg-purple-900/20 hover:bg-purple-900/30 transition-all">
                  <h4 className="font-medium mb-2">Student Profiles</h4>
                  <p className="text-sm text-gray-400">Detailed profiles for each student with achievement history and learning progress.</p>
                </Card>
                
                <Card className="p-4 bg-purple-900/20 hover:bg-purple-900/30 transition-all">
                  <h4 className="font-medium mb-2">Group Management</h4>
                  <p className="text-sm text-gray-400">Create and manage student groups for collaborative learning projects.</p>
                </Card>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="rewards" className="space-y-4">
            <Card className="p-6 glass-card">
              <h3 className="text-lg font-semibold mb-2 gradient-text">NFT Reward System</h3>
              <p className="text-gray-300 mb-4">Motivate and recognize student achievements with unique blockchain-based NFT rewards.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <Card className="relative p-6 flex flex-col items-center bg-gradient-to-br from-blue-900/40 to-purple-900/40 hover:from-blue-900/60 hover:to-purple-900/60 transition-all overflow-hidden">
                  <div className="absolute top-0 right-0 bg-purple-700/70 text-xs px-2 py-1 rounded-bl-lg">Achievement</div>
                  <Award className="w-12 h-12 text-purple-400 mb-3" />
                  <h4 className="text-center font-medium">Perfect Attendance</h4>
                  <p className="text-xs text-center text-gray-400 mt-2">Awarded for 100% attendance in a semester</p>
                </Card>
                
                <Card className="relative p-6 flex flex-col items-center bg-gradient-to-br from-indigo-900/40 to-blue-900/40 hover:from-indigo-900/60 hover:to-blue-900/60 transition-all overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-700/70 text-xs px-2 py-1 rounded-bl-lg">Achievement</div>
                  <Award className="w-12 h-12 text-indigo-400 mb-3" />
                  <h4 className="text-center font-medium">Math Champion</h4>
                  <p className="text-xs text-center text-gray-400 mt-2">Excellence in mathematical problem solving</p>
                </Card>
                
                <Card className="relative p-6 flex flex-col items-center bg-gradient-to-br from-green-900/40 to-emerald-900/40 hover:from-green-900/60 hover:to-emerald-900/60 transition-all overflow-hidden">
                  <div className="absolute top-0 right-0 bg-green-700/70 text-xs px-2 py-1 rounded-bl-lg">Achievement</div>
                  <Award className="w-12 h-12 text-green-400 mb-3" />
                  <h4 className="text-center font-medium">Science Explorer</h4>
                  <p className="text-xs text-center text-gray-400 mt-2">Exceptional work in scientific exploration</p>
                </Card>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-4">
            <Card className="p-6 glass-card">
              <h3 className="text-lg font-semibold mb-2 gradient-text">Learning Progress</h3>
              <p className="text-gray-300 mb-4">Track and visualize student learning progress with detailed analytics and insights.</p>
              
              <div className="border border-purple-900/40 rounded-lg p-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Progress Overview</h4>
                  <div className="text-sm text-gray-400">Spring 2023</div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Mathematics</span>
                      <span className="text-sm text-purple-400">87%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Science</span>
                      <span className="text-sm text-indigo-400">92%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Language Arts</span>
                      <span className="text-sm text-blue-400">78%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Social Studies</span>
                      <span className="text-sm text-green-400">84%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '84%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ViewTeacherDashboard;
