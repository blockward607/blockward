
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Star } from "lucide-react";
import { Label } from "@/components/ui/label";

interface StudentFeedbackFormProps {
  studentId: string;
  studentName: string;
  onFeedbackSent?: () => void;
}

export const StudentFeedbackForm = ({ studentId, studentName, onFeedbackSent }: StudentFeedbackFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("general");
  const [rating, setRating] = useState("3");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter feedback message"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get teacher profile
      const { data: teacherData } = await supabase
        .from('teacher_profiles')
        .select('id, full_name')
        .eq('user_id', session.user.id)
        .single();

      if (!teacherData) throw new Error("Teacher profile not found");

      // Insert feedback
      const { error } = await supabase
        .from('student_feedback')
        .insert({
          student_id: studentId,
          teacher_id: teacherData.id,
          feedback_text: feedback,
          category: category,
          rating: parseInt(rating),
          teacher_name: teacherData.full_name
        });

      if (error) throw error;

      toast({
        title: "Feedback Sent!",
        description: `Feedback sent to ${studentName}`
      });

      setFeedback("");
      setCategory("general");
      setRating("3");
      setIsOpen(false);
      onFeedbackSent?.();
    } catch (error: any) {
      console.error('Error sending feedback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send feedback"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Send Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            Send Feedback to {studentName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-300">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="academic">Academic Performance</SelectItem>
                <SelectItem value="behavior">Behavior</SelectItem>
                <SelectItem value="participation">Class Participation</SelectItem>
                <SelectItem value="improvement">Areas for Improvement</SelectItem>
                <SelectItem value="praise">Praise & Recognition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating" className="text-gray-300">Rating</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger className="bg-gray-800 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Needs Improvement</SelectItem>
                <SelectItem value="2">2 - Below Average</SelectItem>
                <SelectItem value="3">3 - Average</SelectItem>
                <SelectItem value="4">4 - Good</SelectItem>
                <SelectItem value="5">5 - Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-gray-300">Feedback Message</Label>
            <Textarea
              id="feedback"
              placeholder="Enter your feedback for the student..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleSubmitFeedback}
            disabled={loading || !feedback.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? "Sending..." : "Send Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
