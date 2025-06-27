
-- Create table for teacher feedback to students
CREATE TABLE public.student_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) NOT NULL,
  teacher_id UUID REFERENCES public.teacher_profiles(id) NOT NULL,
  feedback_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 3,
  teacher_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.student_feedback ENABLE ROW LEVEL SECURITY;

-- Teachers can insert feedback for their students
CREATE POLICY "Teachers can create feedback" ON public.student_feedback
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teacher_profiles 
      WHERE id = teacher_id AND user_id = auth.uid()
    )
  );

-- Teachers can view feedback they created
CREATE POLICY "Teachers can view their feedback" ON public.student_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teacher_profiles 
      WHERE id = teacher_id AND user_id = auth.uid()
    )
  );

-- Students can view feedback about them
CREATE POLICY "Students can view their feedback" ON public.student_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE id = student_id AND user_id = auth.uid()
    )
  );

-- Teachers can update their own feedback
CREATE POLICY "Teachers can update their feedback" ON public.student_feedback
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.teacher_profiles 
      WHERE id = teacher_id AND user_id = auth.uid()
    )
  );
