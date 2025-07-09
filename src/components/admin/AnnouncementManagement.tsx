
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Edit, Trash2, Send, Users, GraduationCap } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  classroom_id?: string;
  created_at: string;
  created_by: string;
  recipients: any;
  classroom_name?: string;
}

interface Classroom {
  id: string;
  name: string;
}

export const AnnouncementManagement = () => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "general",
    classroom_id: "",
    target_audience: "all"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load announcements
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select(`
          *,
          classrooms(name)
        `)
        .order('created_at', { ascending: false });

      if (notificationsError) throw notificationsError;

      // Load classrooms
      const { data: classroomsData, error: classroomsError } = await supabase
        .from('classrooms')
        .select('id, name');

      if (classroomsError) throw classroomsError;

      setAnnouncements(notificationsData?.map(notification => ({
        ...notification,
        classroom_name: notification.classrooms?.name
      })) || []);
      
      setClassrooms(classroomsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load announcement data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Verify user is admin or teacher
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (roleError || (userRole?.role !== 'admin' && userRole?.role !== 'teacher')) {
        throw new Error("Only admins and teachers can create announcements");
      }

      const announcementData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        classroom_id: formData.classroom_id || null,
        created_by: user.id,
        recipients: {
          target_audience: formData.target_audience,
          classroom_id: formData.classroom_id || null
        }
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('notifications')
          .update(announcementData)
          .eq('id', editingAnnouncement.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Announcement updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('notifications')
          .insert([announcementData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Announcement created successfully"
        });
      }

      setIsCreateOpen(false);
      setEditingAnnouncement(null);
      setFormData({ title: "", message: "", type: "general", classroom_id: "", target_audience: "all" });
      loadData();
    } catch (error: any) {
      console.error('Error saving announcement:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save announcement"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement deleted successfully"
      });
      
      loadData();
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete announcement"
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-500';
      case 'important': return 'bg-orange-500';
      case 'event': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getAudienceIcon = (recipients: any) => {
    if (recipients?.classroom_id) return <GraduationCap className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Announcement Management</h2>
          <p className="text-gray-400">Create and manage school-wide announcements and notifications</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {editingAnnouncement ? 'Update announcement details' : 'Share important information with your school community'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-300">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Announcement title"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-gray-300">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="general" className="text-white">General</SelectItem>
                      <SelectItem value="important" className="text-white">Important</SelectItem>
                      <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                      <SelectItem value="event" className="text-white">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="audience" className="text-gray-300">Target Audience</Label>
                  <Select value={formData.target_audience} onValueChange={(value) => setFormData({...formData, target_audience: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="all" className="text-white">Everyone</SelectItem>
                      <SelectItem value="teachers" className="text-white">Teachers Only</SelectItem>
                      <SelectItem value="students" className="text-white">Students Only</SelectItem>
                      <SelectItem value="class" className="text-white">Specific Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.target_audience === 'class' && (
                <div>
                  <Label htmlFor="classroom" className="text-gray-300">Select Classroom</Label>
                  <Select value={formData.classroom_id} onValueChange={(value) => setFormData({...formData, classroom_id: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Choose a classroom" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.id} className="text-white">
                          {classroom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="message" className="text-gray-300">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Write your announcement message here..."
                  className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingAnnouncement(null);
                    setFormData({ title: "", message: "", type: "general", classroom_id: "", target_audience: "all" });
                  }}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  {editingAnnouncement ? 'Update' : 'Send'} Announcement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Announcements ({announcements.length})
          </CardTitle>
          <CardDescription className="text-gray-400">
            Recent announcements and notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No announcements created yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Title</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Audience</TableHead>
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{announcement.title}</div>
                        <div className="text-sm text-gray-400 max-w-md truncate">
                          {announcement.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getTypeColor(announcement.type)} text-white`}>
                        {announcement.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-300">
                        {getAudienceIcon(announcement.recipients)}
                        <span>
                          {announcement.classroom_name || 
                           announcement.recipients?.target_audience || 'Everyone'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingAnnouncement(announcement);
                            setFormData({
                              title: announcement.title,
                              message: announcement.message,
                              type: announcement.type,
                              classroom_id: announcement.classroom_id || "",
                              target_audience: announcement.recipients?.target_audience || "all"
                            });
                            setIsCreateOpen(true);
                          }}
                          className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(announcement.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
