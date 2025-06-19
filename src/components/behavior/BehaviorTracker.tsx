
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ThumbsUp, ThumbsDown, BarChart3, PieChart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

export const BehaviorTracker = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'list' | 'bar' | 'pie'>('list');
  const [selectedStudent, setSelectedStudent] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: 'positive',
    points: 1,
    description: '',
    category: 'academic'
  });

  const COLORS = ['#00C49F', '#FF8042', '#FFBB28', '#0088FE'];
  const categories = ['academic', 'behavior', 'participation', 'other'];

  useEffect(() => {
    fetchBehaviorRecords();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching students:', error);
        return;
      }

      console.log('Students fetched:', data?.length || 0);
      setStudents(data || []);
    } catch (error) {
      console.error('Error in fetchStudents:', error);
    }
  };

  const fetchBehaviorRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('behavior_records')
        .select(`
          *,
          students (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching behavior records:', error);
        throw error;
      }

      console.log('Behavior records fetched:', data?.length || 0);
      setRecords(data || []);
    } catch (error: any) {
      console.error('Error in fetchBehaviorRecords:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load behavior records"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Form submitted with data:', formData);
    console.log('Selected student:', selectedStudent);

    if (!selectedStudent) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a student"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a description"
      });
      return;
    }

    try {
      const pointsValue = formData.type === 'positive' ? Math.abs(formData.points) : -Math.abs(formData.points);
      
      console.log('Inserting behavior record:', {
        student_id: selectedStudent,
        type: formData.type,
        points: pointsValue,
        description: formData.description.trim(),
        category: formData.category
      });

      const { error } = await supabase
        .from('behavior_records')
        .insert({
          student_id: selectedStudent,
          type: formData.type,
          points: pointsValue,
          description: formData.description.trim(),
          category: formData.category
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Behavior record created successfully');

      toast({
        title: "Success",
        description: "Behavior record added successfully"
      });

      // Reset form and close dialog
      setFormData({
        type: 'positive',
        points: 1,
        description: '',
        category: 'academic'
      });
      setSelectedStudent("");
      setDialogOpen(false);
      
      // Refresh records
      await fetchBehaviorRecords();

    } catch (error: any) {
      console.error('Error creating behavior record:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create behavior record"
      });
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    console.log('Dialog open state changing to:', open);
    setDialogOpen(open);
    if (!open) {
      // Reset form when closing
      setFormData({
        type: 'positive',
        points: 1,
        description: '',
        category: 'academic'
      });
      setSelectedStudent("");
    }
  };

  const getChartData = () => {
    const categoryData = categories.map(category => ({
      name: category,
      value: records.filter(r => r.category === category).length
    }));

    return categoryData;
  };

  const getBarChartData = () => {
    return students.map(student => ({
      name: student.name,
      positive: records.filter(r => r.student_id === student.id && r.points > 0)
        .reduce((sum, record) => sum + record.points, 0),
      negative: Math.abs(records.filter(r => r.student_id === student.id && r.points < 0)
        .reduce((sum, record) => sum + record.points, 0))
    }));
  };

  if (loading) {
    return (
      <Card className="p-6 glass-card">
        <div className="text-white text-center">Loading behavior records...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold gradient-text">Behavior Tracking</h2>
        <div className="flex gap-4">
          <Select value={viewType} onValueChange={(value: 'list' | 'bar' | 'pie') => setViewType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List View</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 transition-colors"
                onClick={() => {
                  console.log('Record Behavior button clicked');
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Record Behavior
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Record New Behavior</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="behavior">Behavior</SelectItem>
                    <SelectItem value="participation">Participation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Points"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="10"
                />

                <Textarea
                  placeholder="Description *"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleDialogOpenChange(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={!selectedStudent || !formData.description.trim()}
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No behavior records found.</p>
          <p className="text-gray-500 text-sm mt-2">Start by recording student behaviors using the button above.</p>
        </div>
      ) : (
        <>
          {viewType === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 glass-card bg-green-900/20">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsUp className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Positive Behaviors</h3>
                </div>
                <div className="space-y-2">
                  {records.filter(r => r.points > 0).map((record) => (
                    <Card key={record.id} className="p-3 bg-green-900/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-white">{record.students?.name}</p>
                          <p className="text-sm text-gray-400">{record.description}</p>
                          <span className="text-xs text-gray-500">Category: {record.category}</span>
                        </div>
                        <span className="text-green-400 font-semibold">+{record.points}</span>
                      </div>
                    </Card>
                  ))}
                  {records.filter(r => r.points > 0).length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No positive behaviors recorded yet.</p>
                  )}
                </div>
              </Card>

              <Card className="p-4 glass-card bg-red-900/20">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsDown className="w-5 h-5 text-red-400" />
                  <h3 className="font-semibold text-white">Negative Behaviors</h3>
                </div>
                <div className="space-y-2">
                  {records.filter(r => r.points < 0).map((record) => (
                    <Card key={record.id} className="p-3 bg-red-900/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-white">{record.students?.name}</p>
                          <p className="text-sm text-gray-400">{record.description}</p>
                          <span className="text-xs text-gray-500">Category: {record.category}</span>
                        </div>
                        <span className="text-red-400 font-semibold">{record.points}</span>
                      </div>
                    </Card>
                  ))}
                  {records.filter(r => r.points < 0).length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No negative behaviors recorded yet.</p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {viewType === 'bar' && (
            <div className="h-[400px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getBarChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="positive" fill="#4ade80" name="Positive Points" />
                  <Bar dataKey="negative" fill="#f87171" name="Negative Points" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {viewType === 'pie' && (
            <div className="h-[400px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={getChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
