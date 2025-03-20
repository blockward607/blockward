
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, School, Users, Award, GraduationCap, BookOpen, MessageSquare, Calendar, ChartBar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ViewTeacherDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("classroom");
  const [selectedFeature, setSelectedFeature] = useState("virtual-classrooms");
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
          <p className="text-gray-300 mb-4">
            Discover what Blockward can offer for your educational experience
          </p>
          
          <div className="max-w-md mx-auto">
            <Select 
              value={selectedFeature} 
              onValueChange={setSelectedFeature}
            >
              <SelectTrigger className="w-full mb-4 bg-purple-900/20 border-purple-500/30">
                <SelectValue placeholder="Select a feature to explore" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-purple-500/30">
                <SelectItem value="virtual-classrooms">Virtual Classrooms</SelectItem>
                <SelectItem value="student-management">Student Management</SelectItem>
                <SelectItem value="blockchain-rewards">Blockchain NFT Rewards</SelectItem>
                <SelectItem value="attendance-tracking">Attendance Tracking</SelectItem>
                <SelectItem value="behavior-management">Behavior Management</SelectItem>
                <SelectItem value="learning-analytics">Learning Analytics</SelectItem>
                <SelectItem value="communication-tools">Communication Tools</SelectItem>
                <SelectItem value="resource-sharing">Resource Sharing</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card className="p-4 bg-purple-900/20 hover:bg-purple-900/30 transition-all">
                  <BookOpen className="w-6 h-6 text-purple-400 mb-2" />
                  <h4 className="font-medium mb-2">Interactive Learning</h4>
                  <p className="text-sm text-gray-400">Create engaging learning experiences with interactive content and real-time feedback.</p>
                </Card>
                
                <Card className="p-4 bg-purple-900/20 hover:bg-purple-900/30 transition-all">
                  <Calendar className="w-6 h-6 text-purple-400 mb-2" />
                  <h4 className="font-medium mb-2">Assignment Scheduling</h4>
                  <p className="text-sm text-gray-400">Plan and schedule assignments with automated reminders and deadline tracking.</p>
                </Card>
              </div>
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
        
        {selectedFeature === "attendance-tracking" && (
          <Card className="p-6 glass-card mt-6">
            <h3 className="text-lg font-semibold mb-2 gradient-text">Attendance Tracking</h3>
            <p className="text-gray-300 mb-4">Take attendance easily and generate reports with our intuitive interface.</p>
            
            <div className="border border-purple-900/40 rounded-lg p-4">
              <Calendar className="w-8 h-8 text-purple-400 mb-3 mx-auto" />
              <h4 className="text-center font-medium mb-3">Today's Attendance</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-green-900/20 rounded-lg flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Present: 22</span>
                </div>
                <div className="p-3 bg-red-900/20 rounded-lg flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">Absent: 3</span>
                </div>
                <div className="p-3 bg-yellow-900/20 rounded-lg flex items-center">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm">Late: 1</span>
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {selectedFeature === "communication-tools" && (
          <Card className="p-6 glass-card mt-6">
            <h3 className="text-lg font-semibold mb-2 gradient-text">Communication Tools</h3>
            <p className="text-gray-300 mb-4">Keep in touch with students and parents through our secure messaging system.</p>
            
            <div className="border border-purple-900/40 rounded-lg p-4">
              <MessageSquare className="w-8 h-8 text-indigo-400 mb-3 mx-auto" />
              <h4 className="text-center font-medium mb-3">Messaging Center</h4>
              
              <div className="space-y-2">
                <div className="p-3 bg-indigo-900/20 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Class Announcement</span>
                    <span className="text-xs text-gray-400">Today, 9:15 AM</span>
                  </div>
                  <p className="text-sm text-gray-300">Remember to bring your science projects tomorrow!</p>
                </div>
                
                <div className="p-3 bg-purple-900/20 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Parent Conference</span>
                    <span className="text-xs text-gray-400">Yesterday, 3:30 PM</span>
                  </div>
                  <p className="text-sm text-gray-300">Parent-teacher conferences will be held next Thursday.</p>
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {selectedFeature === "learning-analytics" && (
          <Card className="p-6 glass-card mt-6">
            <h3 className="text-lg font-semibold mb-2 gradient-text">Learning Analytics</h3>
            <p className="text-gray-300 mb-4">Gain insights into student performance with advanced data analytics.</p>
            
            <div className="border border-purple-900/40 rounded-lg p-4">
              <ChartBar className="w-8 h-8 text-blue-400 mb-3 mx-auto" />
              <h4 className="text-center font-medium mb-3">Performance Insights</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-900/20 rounded-lg">
                  <h5 className="text-sm font-medium mb-2">Class Performance</h5>
                  <div className="flex items-end h-32 gap-2">
                    <div className="bg-blue-700 rounded-t w-full h-[60%]"></div>
                    <div className="bg-blue-600 rounded-t w-full h-[80%]"></div>
                    <div className="bg-blue-500 rounded-t w-full h-[70%]"></div>
                    <div className="bg-blue-400 rounded-t w-full h-[90%]"></div>
                    <div className="bg-blue-300 rounded-t w-full h-[75%]"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Sep</span>
                    <span>Oct</span>
                    <span>Nov</span>
                    <span>Dec</span>
                    <span>Jan</span>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-900/20 rounded-lg">
                  <h5 className="text-sm font-medium mb-2">Subject Mastery</h5>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Reading</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{width: "85%"}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Writing</span>
                        <span>72%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{width: "72%"}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Math</span>
                        <span>90%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{width: "90%"}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {selectedFeature === "resource-sharing" && (
          <Card className="p-6 glass-card mt-6">
            <h3 className="text-lg font-semibold mb-2 gradient-text">Resource Sharing</h3>
            <p className="text-gray-300 mb-4">Share educational materials securely with your students.</p>
            
            <div className="border border-purple-900/40 rounded-lg p-4">
              <BookOpen className="w-8 h-8 text-green-400 mb-3 mx-auto" />
              <h4 className="text-center font-medium mb-3">Learning Resources</h4>
              
              <div className="space-y-2">
                <div className="p-3 bg-green-900/20 rounded-lg flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium">Science Experiment Guide</h5>
                    <p className="text-xs text-gray-400">PDF • 2.4MB</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-900/20">
                    View
                  </Button>
                </div>
                
                <div className="p-3 bg-green-900/20 rounded-lg flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium">Math Problem Set</h5>
                    <p className="text-xs text-gray-400">DOCX • 1.1MB</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-900/20">
                    View
                  </Button>
                </div>
                
                <div className="p-3 bg-green-900/20 rounded-lg flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium">History Timeline</h5>
                    <p className="text-xs text-gray-400">PPTX • 3.8MB</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-900/20">
                    View
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
        
        {selectedFeature === "behavior-management" && (
          <Card className="p-6 glass-card mt-6">
            <h3 className="text-lg font-semibold mb-2 gradient-text">Behavior Management</h3>
            <p className="text-gray-300 mb-4">Track and reward positive student behavior in real-time.</p>
            
            <div className="border border-purple-900/40 rounded-lg p-4">
              <Award className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
              <h4 className="text-center font-medium mb-3">Behavior Points</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-yellow-900/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">157</div>
                  <div className="text-xs text-gray-400">Positive Points</div>
                </div>
                
                <div className="p-3 bg-indigo-900/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-indigo-400 mb-1">14</div>
                  <div className="text-xs text-gray-400">Rewards Given</div>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">Recent Activity</h5>
                <div className="space-y-2">
                  <div className="p-2 bg-yellow-900/10 rounded-lg flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-xs">Emma received 5 points for helping a classmate</span>
                  </div>
                  
                  <div className="p-2 bg-yellow-900/10 rounded-lg flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                    <span className="text-xs">Noah earned 3 points for completing homework early</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default ViewTeacherDashboard;
