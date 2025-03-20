
import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Classroom } from "@/types/classroom";

interface TeacherAnnouncementFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const TeacherAnnouncementForm = ({ onSuccess, onCancel }: TeacherAnnouncementFormProps) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [classroomId, setClassroomId] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeacherClassrooms();
  }, []);

  const fetchTeacherClassrooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', session.user.id);

      if (error) throw error;
      setClassrooms(data || []);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase.from('notifications').insert({
        title,
        message,
        classroom_id: classroomId, // For all students if null
        created_by: session.user.id,
        type: 'announcement'
      });

      if (error) throw error;
      
      onSuccess();
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create announcement"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-4">Create New Announcement</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Enter announcement title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="classroom">Class (optional)</Label>
        <Select value={classroomId || ''} onValueChange={setClassroomId}>
          <SelectTrigger>
            <SelectValue placeholder="All students" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All students</SelectItem>
            {classrooms.map((classroom) => (
              <SelectItem key={classroom.id} value={classroom.id}>
                {classroom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400">Leave empty to send to all students</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Enter your announcement message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Publishing..." : "Publish Announcement"}
        </Button>
      </div>
    </form>
  );
};
