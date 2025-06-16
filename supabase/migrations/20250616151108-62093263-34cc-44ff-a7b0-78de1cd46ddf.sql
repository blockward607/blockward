
-- Create admin access levels enum
CREATE TYPE admin_access_level AS ENUM ('super_admin', 'ict_admin', 'head_teacher', 'department_head', 'form_tutor');

-- Add access_level to admin_profiles table
ALTER TABLE public.admin_profiles 
ADD COLUMN access_level admin_access_level DEFAULT 'ict_admin';

-- Create teacher_class_assignments table for managing which teachers can access which classes
CREATE TABLE public.teacher_class_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL DEFAULT 'subject_teacher', -- 'subject_teacher', 'form_tutor', 'assistant'
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(teacher_id, classroom_id, assignment_type)
);

-- Create homerooms table (form groups)
CREATE TABLE public.homerooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year_group TEXT,
  form_tutor_id UUID REFERENCES public.teacher_profiles(id),
  room_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student_homeroom_assignments table
CREATE TABLE public.student_homeroom_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  homeroom_id UUID NOT NULL REFERENCES public.homerooms(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(student_id, academic_year)
);

-- Add school_id to classrooms table if not exists
ALTER TABLE public.classrooms 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);

-- Add section column to classrooms for better organization
ALTER TABLE public.classrooms 
ADD COLUMN IF NOT EXISTS section TEXT;

-- Enable RLS on new tables
ALTER TABLE public.teacher_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homerooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_homeroom_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for teacher_class_assignments
CREATE POLICY "Admins can manage teacher assignments" ON public.teacher_class_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles ap
      WHERE ap.user_id = auth.uid()
      AND ap.access_level IN ('super_admin', 'ict_admin', 'head_teacher')
    )
  );

CREATE POLICY "Teachers can view their assignments" ON public.teacher_class_assignments
  FOR SELECT USING (
    teacher_id IN (
      SELECT id FROM public.teacher_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS policies for homerooms
CREATE POLICY "School admins can manage homerooms" ON public.homerooms
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM public.admin_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS policies for student_homeroom_assignments
CREATE POLICY "School admins can manage student homeroom assignments" ON public.student_homeroom_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles ap
      JOIN public.homerooms h ON h.school_id = ap.school_id
      WHERE ap.user_id = auth.uid() AND h.id = homeroom_id
    )
  );

-- Function to assign teacher to classroom
CREATE OR REPLACE FUNCTION public.assign_teacher_to_classroom(
  p_teacher_id UUID,
  p_classroom_id UUID,
  p_assignment_type TEXT DEFAULT 'subject_teacher'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = auth.uid() 
    AND access_level IN ('super_admin', 'ict_admin', 'head_teacher')
  ) THEN
    RAISE EXCEPTION 'Insufficient privileges to assign teachers';
  END IF;

  -- Insert or update assignment
  INSERT INTO public.teacher_class_assignments (
    teacher_id, classroom_id, assignment_type, assigned_by
  ) VALUES (
    p_teacher_id, p_classroom_id, p_assignment_type, auth.uid()
  )
  ON CONFLICT (teacher_id, classroom_id, assignment_type) 
  DO UPDATE SET 
    is_active = true,
    assigned_by = auth.uid(),
    assigned_at = now();

  RETURN TRUE;
END;
$$;

-- Function to create homeroom
CREATE OR REPLACE FUNCTION public.create_homeroom(
  p_name TEXT,
  p_year_group TEXT,
  p_form_tutor_id UUID DEFAULT NULL,
  p_room_number TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_homeroom_id UUID;
  admin_school_id UUID;
BEGIN
  -- Get admin's school
  SELECT school_id INTO admin_school_id
  FROM public.admin_profiles 
  WHERE user_id = auth.uid()
  AND access_level IN ('super_admin', 'ict_admin', 'head_teacher');

  IF admin_school_id IS NULL THEN
    RAISE EXCEPTION 'Insufficient privileges or no school association';
  END IF;

  -- Create homeroom
  INSERT INTO public.homerooms (
    school_id, name, year_group, form_tutor_id, room_number
  ) VALUES (
    admin_school_id, p_name, p_year_group, p_form_tutor_id, p_room_number
  )
  RETURNING id INTO new_homeroom_id;

  RETURN new_homeroom_id;
END;
$$;
