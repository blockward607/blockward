import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Upload, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { StudentSelect } from "@/components/nft/StudentSelect";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  type: string;
  status: string;
  points: number;
}

const Assignments = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    type: "homework",
    points: 100
  });

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "1",
      title: "Math Problem Set",
      description: "Complete problems 1-20 on page 45",
      dueDate: "2023-11-15",
      type: "homework",
      status: "submitted",
      points: 100
    },
    {
      id: "2",
      title: "Science Lab Report",
      description: "Write a report on the water cycle experiment",
      dueDate: "2023-11-20",
      type: "project",
      status: "in-progress",
      points: 150
    },
    {
      id: "3",
      title: "History Essay",
      description: "Write a 500-word essay on Ancient Rome",
      dueDate: "2023-11-25",
      type: "essay",
      status: "not-started",
      points: 200
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a student for this assignment"
      });
      return;
    }

    setLoading(true);

    try {
      const newAssignment: Assignment = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        dueDate: `${formData.dueDate} ${formData.dueTime}`,
        type: formData.type,
        status: "not-started",
        points: formData.points
      };

      setAssignments([...assignments, newAssignment]);
      
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });

      setFormData({
        title: "",
        description: "",
        dueDate: "",
        dueTime: "",
        type: "homework",
        points: 100
      });
      setSelectedStudent("");
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create assignment",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-green-600/20 text-green-400 border-green-500/30";
      case "in-progress":
        return "bg-blue-600/20 text-blue-400 border-blue-500/30";
      case "not-started":
        return "bg-purple-600/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "homework":
        return <FileText className="w-5 h-5 text-purple-400" />;
      case "project":
        return <Sparkles className="w-5 h-5 text-blue-400" />;
      case "essay":
        return <FileText className="w-5 h-5 text-green-400" />;
      case "quiz":
        return <CheckCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <FileText className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Assignments & Activities</h1>
      
      <div className="grid gap-6 md:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 glass-card">
              <h2 className="text-xl font-semibold mb-4">Create New Assignment</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter assignment title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="glass-input"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter assignment details"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="glass-input min-h-[100px]"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" /> Due Date
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="glass-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dueTime" className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" /> Due Time
                    </Label>
                    <Input
                      id="dueTime"
                      type="time"
                      value={formData.dueTime}
                      onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                      className="glass-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Assignment Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="glass-input">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homework">Homework</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min="0"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                      className="glass-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" /> Assign To
                  </Label>
                  <StudentSelect
                    selectedStudentId={selectedStudent}
                    onStudentSelect={setSelectedStudent}
                  />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Create Assignment
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Current Assignments</h2>
            
            {assignments.map((assignment, index) => (
              <motion.div 
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="p-5 glass-card hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-purple-800/20">
                      {getTypeIcon(assignment.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{assignment.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{assignment.description}</p>
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                          {assignment.status.replace('-', ' ')}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {assignment.dueDate}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-purple-400">
                          <Sparkles className="w-4 h-4" />
                          <span>{assignment.points} Points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <Card className="p-6 glass-card">
            <h3 className="text-lg font-semibold mb-4">Assignment Progress</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-purple-400">33%</span>
                </div>
                <div className="h-2 bg-purple-900/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-1/3"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-900/10 rounded-lg text-center">
                  <h4 className="text-gray-400 text-sm mb-1">To Do</h4>
                  <p className="text-2xl font-bold text-white">2</p>
                </div>
                
                <div className="p-4 bg-purple-900/10 rounded-lg text-center">
                  <h4 className="text-gray-400 text-sm mb-1">Completed</h4>
                  <p className="text-2xl font-bold text-white">1</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Upcoming Due Dates</h4>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                    <div>
                      <p className="font-medium">Science Lab Report</p>
                      <p className="text-sm text-gray-400">Due Nov 20</p>
                    </div>
                    <div className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 text-xs font-medium">
                      In Progress
                    </div>
                  </li>
                  <li className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                    <div>
                      <p className="font-medium">History Essay</p>
                      <p className="text-sm text-gray-400">Due Nov 25</p>
                    </div>
                    <div className="px-2 py-1 rounded bg-purple-600/20 text-purple-400 text-xs font-medium">
                      Not Started
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Assignments;
