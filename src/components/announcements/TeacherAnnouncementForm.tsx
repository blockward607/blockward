
import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentSelector } from "./StudentSelector";
import type { Classroom } from "@/types/classroom";

interface TeacherAnnouncementFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  defaultClassroomId?: string;
}

export const TeacherAnnouncementForm = ({ 
  onSuccess, 
  onCancel, 
  defaultClassroomId 
}: TeacherAnnouncementFormProps) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<string>('all');
  const [classroomId, setClassroomId] = useState<string | null>(defaultClassroomId || null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeacherClassrooms();
  }, []);

  useEffect(() => {
    if (defaultClassroomId) {
      setClassroomId(defaultClassroomId);
      setTargetType('classroom');
    }
  }, [defaultClassroomId]);

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

    if (targetType === 'students' && selectedStudents.length === 0) {
      toast({
        variant: "destructive",
        title: "No students selected",
        description: "Please select at least one student for individual targeting"
      });
      return;
    }

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const payload: any = {
        title,
        message,
        created_by: session.user.id,
        type: 'announcement'
      };

      // Set targeting based on selection
      if (targetType === 'classroom' && classroomId) {
        payload.classroom_id = classroomId;
      } else if (targetType === 'students') {
        payload.recipients = selectedStudents;
      }
      // For 'all' type, we leave both classroom_id and recipients as null

      const { error } = await supabase.from('notifications').insert(payload);

      if (error) throw error;
      
      const targetDescription = 
        targetType === 'all' ? 'for all students' :
        targetType === 'classroom' ? 'for selected classroom' :
        `for ${selectedStudents.length} selected students`;

      toast({
        title: "Success",
        description: `Announcement ${targetDescription} published successfully`
      });
      
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
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="space-y-3">
        <Label>Target Audience</Label>
        <RadioGroup value={targetType} onValueChange={setTargetType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all">All Students</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="classroom" id="classroom" />
            <Label htmlFor="classroom">Specific Classroom</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="students" id="students" />
            <Label htmlFor="students">Individual Students</Label>
          </div>
        </RadioGroup>
      </div>

      {targetType === 'classroom' && (
        <div className="space-y-2">
          <Label htmlFor="classroom-select">Select Classroom</Label>
          <Select value={classroomId || ''} onValueChange={setClassroomId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a classroom" />
            </SelectTrigger>
            <SelectContent>
              {classrooms.map((classroom) => (
                <SelectItem key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {targetType === 'students' && (
        <StudentSelector
          selectedStudents={selectedStudents}
          onStudentsChange={setSelectedStudents}
          classroomId={targetType === 'classroom' ? classroomId || undefined : undefined}
        />
      )}

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
