
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Star, Calendar } from "lucide-react";
import { format } from "date-fns";

export const StudentFeedbackView = () => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get student profile
      const { data: studentData } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!studentData) return;

      // Fetch feedback
      const { data: feedbackData, error } = await supabase
        .from('student_feedback')
        .select('*')
        .eq('student_id', studentData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setFeedback(feedbackData || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load feedback"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      academic: 'text-blue-400',
      behavior: 'text-green-400',
      participation: 'text-purple-400',
      improvement: 'text-orange-400',
      praise: 'text-pink-400',
      general: 'text-gray-400'
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <Card className="p-6 glass-card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Teacher Feedback</h3>
      </div>

      {feedback.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No feedback received yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-white">{item.teacher_name}</p>
                  <p className={`text-sm capitalize ${getCategoryColor(item.category)}`}>
                    {item.category} Feedback
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(item.rating)}
                </div>
              </div>
              
              <p className="text-gray-300 mb-3">{item.feedback_text}</p>
              
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                {format(new Date(item.created_at), 'MMM dd, yyyy')}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
