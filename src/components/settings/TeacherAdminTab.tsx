
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
  Bot,
  Search,
  Filter,
  Star,
  Trash2,
  Edit,
  Send,
  Calendar,
  BookOpen,
  Database,
  Zap,
  Award,
  Target,
  TrendingUp,
  Globe,
  Wifi,
  Camera,
  Mic,
  Video,
  Phone,
  Mail,
  MapPin,
  Home,
  School,
  GraduationCap,
  Briefcase
} from "lucide-react";

export const TeacherAdminTab = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [classLocked, setClassLocked] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [aiAssistEnabled, setAiAssistEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const mockClasses = [
    { id: "1", name: "Mathematics 101", code: "MATH101", students: 25, locked: false, status: "active" },
    { id: "2", name: "Science Lab", code: "SCI202", students: 18, locked: true, status: "archived" },
    { id: "3", name: "History Class", code: "HIST303", students: 22, locked: false, status: "active" },
    { id: "4", name: "English Literature", code: "ENG404", students: 20, locked: false, status: "draft" }
  ];

  const mockStudents = [
    { id: "1", name: "John Smith", email: "john@example.com", status: "active", lastActive: "2 hours ago", points: 850 },
    { id: "2", name: "Sarah Johnson", email: "sarah@example.com", status: "pending", lastActive: "1 day ago", points: 720 },
    { id: "3", name: "Mike Wilson", email: "mike@example.com", status: "blocked", lastActive: "3 days ago", points: 420 },
    { id: "4", name: "Emma Davis", email: "emma@example.com", status: "active", lastActive: "5 hours ago", points: 950 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">Teacher Admin Controls</h2>
        <Badge variant="secondary" className="ml-auto">Advanced Features</Badge>
      </div>

      {/* Quick Actions Bar */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Zap className="w-3 h-3 mr-1" />
              Quick Setup
            </Button>
            <Button size="sm" variant="outline">
              <Database className="w-3 h-3 mr-1" />
              Backup Data
            </Button>
            <Button size="sm" variant="outline">
              <Globe className="w-3 h-3 mr-1" />
              Sync Google Classroom
            </Button>
            <Button size="sm" variant="outline">
              <Award className="w-3 h-3 mr-1" />
              Mass Award Points
            </Button>
            <Button size="sm" variant="outline">
              <TrendingUp className="w-3 h-3 mr-1" />
              Analytics Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Enhanced Class Controls Tab */}
        <TabsContent value="classes" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Advanced Class Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input 
                    placeholder="Search classes..." 
                    className="pl-10 bg-gray-700 border-gray-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockClasses.map((classItem) => (
                  <div key={classItem.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">{classItem.name}</h3>
                      <div className="flex gap-1">
                        <Badge variant={classItem.locked ? "destructive" : "default"}>
                          {classItem.locked ? "Locked" : "Open"}
                        </Badge>
                        <Badge variant={classItem.status === "active" ? "default" : "secondary"}>
                          {classItem.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Code: {classItem.code} • {classItem.students} students
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      <Button size="sm" variant="outline">
                        <Key className="w-3 h-3 mr-1" />
                        New Code
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="w-3 h-3 mr-1" />
                        Clone
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Button>
                      <Button size="sm" variant="outline">
                        {classItem.locked ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                        {classItem.locked ? "Unlock" : "Lock"}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Archive className="w-3 h-3 mr-1" />
                        Archive
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bulk Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-600">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Bulk Settings
                </Button>
                <Button variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Selected
                </Button>
                <Button variant="outline">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Selected
                </Button>
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
                      <Label className="text-gray-200">Subject</Label>
                      <Select>
                        <SelectTrigger className="bg-gray-700 border-gray-600">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="math">Mathematics</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="history">History</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-200">Description</Label>
                      <Textarea placeholder="Class description" className="bg-gray-700 border-gray-600" />
                    </div>
                    <div>
                      <Label className="text-gray-200">Section</Label>
                      <Input placeholder="e.g., Section A" className="bg-gray-700 border-gray-600" />
                    </div>
                    <div>
                      <Label className="text-gray-200">Capacity</Label>
                      <Input type="number" placeholder="Max students" className="bg-gray-700 border-gray-600" />
                    </div>
                    <Button className="w-full">Create Class</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Student Management Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Advanced Student Management
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
                        <Label className="text-gray-200">Student ID</Label>
                        <Input placeholder="Student ID number" className="bg-gray-700 border-gray-600" />
                      </div>
                      <div>
                        <Label className="text-gray-200">Grade Level</Label>
                        <Select>
                          <SelectTrigger className="bg-gray-700 border-gray-600">
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9">Grade 9</SelectItem>
                            <SelectItem value="10">Grade 10</SelectItem>
                            <SelectItem value="11">Grade 11</SelectItem>
                            <SelectItem value="12">Grade 12</SelectItem>
                          </SelectContent>
                        </Select>
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
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Send Invites
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export List
                </Button>
              </div>

              <div className="space-y-2">
                {mockStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-white">{student.name}</p>
                        <p className="text-sm text-gray-400">{student.email} • Last active: {student.lastActive}</p>
                        <p className="text-xs text-purple-400">{student.points} points</p>
                      </div>
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
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Reset Password
                      </Button>
                      <Button size="sm" variant="outline">
                        <Award className="w-3 h-3 mr-1" />
                        Award Points
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

        {/* Enhanced Content & Assignment Tools Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Content & Assignment Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <Button className="h-20 flex-col" variant="outline">
                  <BookOpen className="w-6 h-6 mb-2" />
                  Create Quiz
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Camera className="w-6 h-6 mb-2" />
                  Record Lesson
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Video className="w-6 h-6 mb-2" />
                  Live Stream
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Bot className="w-6 h-6 mb-2" />
                  AI Assistant
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Recent Resources</h4>
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    View All
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <div>
                        <span className="text-white">Math Worksheet 1.pdf</span>
                        <p className="text-xs text-gray-400">Uploaded 2 hours ago • 1.2MB</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Share</Button>
                      <Button size="sm" variant="outline">Delete</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Video className="w-4 h-4 text-blue-400" />
                      <div>
                        <span className="text-white">Science Lab Demo.mp4</span>
                        <p className="text-xs text-gray-400">Uploaded 1 day ago • 45MB</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Share</Button>
                      <Button size="sm" variant="outline">Delete</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Communication Settings Tab */}
        <TabsContent value="communication" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Communication Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Class Chat</h4>
                    <p className="text-sm text-gray-400">Allow students to chat in class</p>
                  </div>
                  <Switch checked={chatEnabled} onCheckedChange={setChatEnabled} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">AI Assistant</h4>
                    <p className="text-sm text-gray-400">Enable AI-powered assistance</p>
                  </div>
                  <Switch checked={aiAssistEnabled} onCheckedChange={setAiAssistEnabled} />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Video Calls</h4>
                    <p className="text-sm text-gray-400">Enable video conferencing</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">Screen Sharing</h4>
                    <p className="text-sm text-gray-400">Allow screen sharing in class</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-white">Quick Communication Tools</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Conference Call
                  </Button>
                  <Button variant="outline">
                    <Bell className="w-4 h-4 mr-2" />
                    Alert All
                  </Button>
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
                  <Button variant="outline">
                    Schedule for Later
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Performance & Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart className="w-5 h-5" />
                Analytics & Performance Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-20 flex-col" variant="outline">
                  <Download className="w-6 h-6 mb-2" />
                  Export CSV
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <FileText className="w-6 h-6 mb-2" />
                  Export PDF
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Clock className="w-6 h-6 mb-2" />
                  Attendance Reports
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <BarChart className="w-6 h-6 mb-2" />
                  Engagement Reports
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  Performance Analytics
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Target className="w-6 h-6 mb-2" />
                  Goal Tracking
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Award className="w-6 h-6 mb-2" />
                  Achievement Reports
                </Button>
                <Button className="h-20 flex-col" variant="outline">
                  <Calendar className="w-6 h-6 mb-2" />
                  Schedule Reports
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-700 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-400">85%</div>
                  <div className="text-sm text-gray-400">Average Attendance</div>
                  <div className="text-xs text-green-400 mt-1">+5% from last month</div>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-400">92%</div>
                  <div className="text-sm text-gray-400">Assignment Completion</div>
                  <div className="text-xs text-green-400 mt-1">+8% from last month</div>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg text-center">
                  <div className="text-3xl font-bold text-yellow-400">7.8</div>
                  <div className="text-sm text-gray-400">Average Grade</div>
                  <div className="text-xs text-green-400 mt-1">+0.3 from last month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Advanced Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Advanced Settings & Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button className="h-16 flex-col" variant="outline">
                  <Database className="w-5 h-5 mb-1" />
                  Data Migration
                </Button>
                <Button className="h-16 flex-col" variant="outline">
                  <Wifi className="w-5 h-5 mb-1" />
                  API Integration
                </Button>
                <Button className="h-16 flex-col" variant="outline">
                  <Shield className="w-5 h-5 mb-1" />
                  Security Settings
                </Button>
                <Button className="h-16 flex-col" variant="outline">
                  <Palette className="w-5 h-5 mb-1" />
                  Theme Customization
                </Button>
                <Button className="h-16 flex-col" variant="outline">
                  <Globe className="w-5 h-5 mb-1" />
                  Language Settings
                </Button>
                <Button className="h-16 flex-col" variant="outline">
                  <Archive className="w-5 h-5 mb-1" />
                  Archive Management
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-white">System Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">Auto-save drafts</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">Enable debug mode</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">Show advanced features</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-white">Beta features access</span>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-white">Danger Zone</h4>
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-red-400">Reset All Settings</h5>
                      <p className="text-sm text-gray-400">This will reset all customizations to default</p>
                    </div>
                    <Button variant="destructive">Reset</Button>
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
