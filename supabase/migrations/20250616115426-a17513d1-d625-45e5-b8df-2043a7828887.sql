
-- Check if we need to add recipient targeting to notifications table
-- Add recipients field to support individual student targeting
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS recipients JSONB DEFAULT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipients ON public.notifications USING GIN (recipients);
CREATE INDEX IF NOT EXISTS idx_notifications_classroom_id ON public.notifications (classroom_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_by ON public.notifications (created_by);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy for teachers to see their own announcements
CREATE POLICY "Teachers can view their own announcements" ON public.notifications
FOR SELECT USING (
  created_by = auth.uid() OR
  -- Allow viewing announcements in classrooms they teach
  EXISTS (
    SELECT 1 FROM public.classrooms c
    JOIN public.teacher_profiles tp ON c.teacher_id = tp.id
    WHERE c.id = notifications.classroom_id 
    AND tp.user_id = auth.uid()
  )
);

-- Policy for students to see announcements targeted to them
CREATE POLICY "Students can view announcements targeted to them" ON public.notifications
FOR SELECT USING (
  -- Global announcements (no classroom_id and no specific recipients)
  (classroom_id IS NULL AND recipients IS NULL) OR
  -- Classroom-specific announcements for enrolled students
  (classroom_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.classroom_students cs
    JOIN public.students s ON cs.student_id = s.id
    WHERE cs.classroom_id = notifications.classroom_id 
    AND s.user_id = auth.uid()
  )) OR
  -- Individual student targeting
  (recipients IS NOT NULL AND recipients ? auth.uid()::text)
);

-- Policy for teachers to create announcements
CREATE POLICY "Teachers can create announcements" ON public.notifications
FOR INSERT WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.teacher_profiles tp
    WHERE tp.user_id = auth.uid()
  )
);

-- Policy for teachers to update their own announcements
CREATE POLICY "Teachers can update their own announcements" ON public.notifications
FOR UPDATE USING (created_by = auth.uid());

-- Policy for teachers to delete their own announcements
CREATE POLICY "Teachers can delete their own announcements" ON public.notifications
FOR DELETE USING (created_by = auth.uid());
