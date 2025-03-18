
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Send, X } from "lucide-react";
import type { Notification } from "@/types/notification";
import { motion, AnimatePresence } from "framer-motion";

export const TeacherDashboard = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [announcements, setAnnouncements] = useState<Notification[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch classroom data on component mount
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (teacherProfile) {
          const { data, error } = await supabase
            .from('classrooms')
            .select('*')
            .eq('teacher_id', teacherProfile.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          
          if (data && data.length > 0) {
            setSelectedClassroom(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching classrooms:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load classrooms"
        });
      }
    };

    fetchClassrooms();
  }, [toast]);

  const handleCreateAnnouncement = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both a title and a message for your announcement"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          title: title.trim(),
          message: message.trim(),
          created_by: session?.user.id,
          type: 'announcement',
          classroom_id: selectedClassroom
        })
        .select();

      if (error) throw error;

      toast({
        title: "Announcement created",
        description: "Your announcement has been published successfully"
      });

      // Clear the form
      setTitle("");
      setMessage("");
      
      // Close the form after successful submission
      setShowForm(false);
      
      // Add the new announcement to the list
      if (data && data.length > 0) {
        setAnnouncements([data[0], ...announcements]);
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create announcement. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    // Reset form when closing
    if (showForm) {
      setTitle("");
      setMessage("");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-4">
        <Button
          onClick={toggleForm}
          className={`rounded-full ${showForm ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}`}
          size="icon"
        >
          {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-black border-purple-500/30 mb-8">
              <h2 className="text-2xl font-bold mb-4">Create Announcement</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title"
                    className="w-full bg-black/50 border-purple-500/30"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your announcement here..."
                    className="w-full min-h-[120px] bg-black/50 border-purple-500/30"
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={handleCreateAnnouncement} 
                    disabled={isSubmitting || !title || !message}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post Announcement
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Announcements</h2>
        <AnnouncementsList />
      </div>
    </div>
  );
};

const AnnouncementsList = () => {
  const [announcements, setAnnouncements] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('type', 'announcement')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card className="p-6 text-center bg-black/50 border-purple-500/20">
        <p className="text-gray-400">No announcements yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <Card key={announcement.id} className="p-6 bg-black/50 border-purple-500/30">
          <h3 className="text-xl font-bold mb-2">{announcement.title}</h3>
          <p className="text-gray-300 mb-4">{announcement.message}</p>
          <div className="text-sm text-gray-400">
            Posted on {new Date(announcement.created_at).toLocaleDateString()} at {new Date(announcement.created_at).toLocaleTimeString()}
          </div>
        </Card>
      ))}
    </div>
  );
};
