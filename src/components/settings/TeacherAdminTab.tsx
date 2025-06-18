
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Lock, 
  Unlock, 
  Users, 
  Settings, 
  Upload, 
  Download,
  Bell,
  BarChart,
  Archive,
  Copy,
  Key,
  Shield,
  MessageSquare,
  FileText,
  Clock,
  UserPlus,
  UserMinus,
  RefreshCw,
  Eye,
  Palette,
  Bot
} from "lucide-react";

export const TeacherAdminTab = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [classLocked, setClassLocked] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [aiAssistEnabled, setAiAssistEnabled] = useState(true);

  // Mock data for demonstration
  const mockClasses = [
    { id: "1", name: "Mathematics 101", code: "MATH101", students: 25, locked: false },
    { id: "2", name: "Science Lab", code: "SCI202", students: 18, locked: true },
    { id: "3", name: "History Class", code: "HIST303", students: 22, locked: false }
  ];

  const mockStudents = [
    { id: "1", name: "John Smith", email: "john@example.com", status: "active", lastActive: "2 hours ago" },
    { id: "2", name: "Sarah Johnson", email: "sarah@example.com", status: "pending", lastActive: "1 day ago" },
    { id: "3", name: "Mike Wilson", email: "mike@example.com", status: "blocked", lastActive: "3 days ago" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">Teacher Admin Controls</h2>
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Class Controls Tab */}
        <TabsContent value="classes" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Class Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockClasses.map((classItem) => (
                  <div key={classItem.id} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{classItem.name}</h3>
                      <Badge variant={classItem.locked ? "destructive" : "default"}>
                        {classItem.locked ? "Locked" : "Open"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Code: {classItem.code} • {classItem.students} students
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline">
                        <Key className="w-3 h-3 mr-1" />
                        New Code
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="w-3 h-3 mr-1" />
                        Clone
                      </Button>
                      <Button size="sm" variant="outline">
                        {classItem.locked ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                        {classItem.locked ? "Unlock" : "Lock"}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Archive className="w-3 h-3 mr-1" />
                        Archive
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Create New Class
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Class</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-200">Class Name</Label>
                      <Input placeholder="Enter class name" className="bg-gray-700 border-gray-600" />
                    </div>
                    <div>
                      <Label className="text-gray-200">Description</Label>
                      <Textarea placeholder="Class description" className="bg-gray-700 border-gray-600" />
                    </div>
                    <div>
                      <Label className="text-gray-200">Section</Label>
                      <Input placeholder="e.g., Section A" className="bg-gray-700 border-gray-600" />
                    </div>
                    <Button className="w-full">Create Class</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Management Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Student Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add Student</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-200">Student Name</Label>
                        <Input placeholder="Enter student name" className="bg-gray-700 border-gray-600" />
                      </div>
                      <div>
                        <Label className="text-gray-200">Email</Label>
                        <Input placeholder="student@example.com" className="bg-gray-700 border-gray-600" />
                      </div>
                      <div>
                        <Label className="text-gray-200">Class</Label>
                        <Select>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockClasses.map((classItem) => (
                              <SelectItem key={classItem.id} value={classItem.id}>
                                {classItem.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full">Add Student</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
              </div>

              <div className="space-y-2">
                {mockStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-white">{student.name}</p>
                      <p className="text-sm text-gray-400">{student.email} • Last active: {student.lastActive}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={student.status === "active" ? "default" : student.status === "pending" ? "secondary" : "destructive"}>
                        {student.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Reset Password
                      </Button>
                      <Button size="sm" variant="destructive">
                        <UserMinus className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content & Assignment Tools Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Content & Assignment Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-20 flex-col">
                  <Upload className="w-6 h-6 mb-2" />
                  Upload Resources
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Clock className="w-6 h-6 mb-2" />
                  Set Deadlines
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Copy className="w-6 h-6 mb-2" />
                  Clone Assignments
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Settings className="w-6 h-6 mb-2" />
                  Grading Schemes
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-white">Recent Resources</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="text-white">Math Worksheet 1.pdf</span>
                    </div>
                    <Button size="sm" variant="outline">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="text-white">Science Lab Guide.docx</span>
                    </div>
                    <Button size="sm" variant="outline">Manage</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Settings Tab */}
        <TabsContent value="communication" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Communication Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Class Chat</h4>
                    <p className="text-sm text-gray-400">Allow students to chat in class</p>
                  </div>
                  <Switch checked={chatEnabled} onCheckedChange={setChatEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">AI Assistant</h4>
                    <p className="text-sm text-gray-400">Enable AI-powered quiz and homework assistance</p>
                  </div>
                  <Switch checked={aiAssistEnabled} onCheckedChange={setAiAssistEnabled} />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-white">Broadcast Announcements</h4>
                <Textarea 
                  placeholder="Type your announcement here..." 
                  className="bg-gray-700 border-gray-600"
                />
                <div className="flex gap-2">
                  <Button>
                    <Bell className="w-4 h-4 mr-2" />
                    Send to All Classes
                  </Button>
                  <Button variant="outline">
                    Send to Selected Class
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-white">Student Moderation</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">John Smith</span>
                    <Button size="sm" variant="outline">Mute</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">Sarah Johnson</span>
                    <Button size="sm" variant="outline">Unmute</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance & Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Performance & Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-20 flex-col" variant="outline">
                  <Download className="w-6 h-6 mb-2" />
                  Export Progress (CSV)
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <FileText className="w-6 h-6 mb-2" />
                  Export Progress (PDF)
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Clock className="w-6 h-6 mb-2" />
                  Attendance Reports
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <BarChart className="w-6 h-6 mb-2" />
                  Engagement Reports
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-white">Custom Grading Rubrics</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">Math Assignment Rubric</span>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">Science Lab Rubric</span>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Create New Rubric
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-white">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-700 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">85%</div>
                    <div className="text-sm text-gray-400">Average Attendance</div>
                  </div>
                  <div className="p-3 bg-gray-700 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">92%</div>
                    <div className="text-sm text-gray-400">Assignment Completion</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
