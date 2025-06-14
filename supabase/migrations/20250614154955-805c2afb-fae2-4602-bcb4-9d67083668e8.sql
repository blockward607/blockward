
-- Create a dedicated classroom_codes table for better organization
CREATE TABLE public.classroom_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '90 days'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER DEFAULT NULL -- NULL means unlimited uses
);

-- Create index for fast code lookups
CREATE INDEX idx_classroom_codes_code ON public.classroom_codes(code) WHERE is_active = true;
CREATE INDEX idx_classroom_codes_classroom ON public.classroom_codes(classroom_id);

-- Add RLS policies
ALTER TABLE public.classroom_codes ENABLE ROW LEVEL SECURITY;

-- Teachers can view codes for their classrooms
CREATE POLICY "Teachers can view their classroom codes" ON public.classroom_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.classrooms c 
      WHERE c.id = classroom_codes.classroom_id 
      AND c.teacher_id IN (
        SELECT tp.id FROM public.teacher_profiles tp WHERE tp.user_id = auth.uid()
      )
    )
  );

-- Teachers can create codes for their classrooms
CREATE POLICY "Teachers can create codes for their classrooms" ON public.classroom_codes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.classrooms c 
      WHERE c.id = classroom_codes.classroom_id 
      AND c.teacher_id IN (
        SELECT tp.id FROM public.teacher_profiles tp WHERE tp.user_id = auth.uid()
      )
    )
  );

-- Students can view active codes (for joining)
CREATE POLICY "Students can view active codes" ON public.classroom_codes
  FOR SELECT USING (is_active = true AND expires_at > now());

-- Function to generate a unique classroom code
CREATE OR REPLACE FUNCTION generate_classroom_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN := true;
BEGIN
  -- Keep generating until we get a unique code
  WHILE code_exists LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.classroom_codes WHERE code = result AND is_active = true) INTO code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new classroom code
CREATE OR REPLACE FUNCTION create_classroom_code(p_classroom_id UUID, p_created_by UUID)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Deactivate any existing codes for this classroom
  UPDATE public.classroom_codes 
  SET is_active = false 
  WHERE classroom_id = p_classroom_id AND is_active = true;
  
  -- Generate new code
  new_code := generate_classroom_code();
  
  -- Insert new code
  INSERT INTO public.classroom_codes (classroom_id, code, created_by)
  VALUES (p_classroom_id, new_code, p_created_by);
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join classroom with code
CREATE OR REPLACE FUNCTION join_classroom_with_code(p_code TEXT, p_student_id UUID)
RETURNS JSONB AS $$
DECLARE
  classroom_record RECORD;
  result JSONB;
BEGIN
  -- Find active classroom code
  SELECT cc.*, c.name as classroom_name 
  INTO classroom_record
  FROM public.classroom_codes cc
  JOIN public.classrooms c ON c.id = cc.classroom_id
  WHERE cc.code = UPPER(p_code) 
  AND cc.is_active = true 
  AND cc.expires_at > now()
  AND (cc.max_uses IS NULL OR cc.usage_count < cc.max_uses);
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired classroom code');
  END IF;
  
  -- Check if student is already enrolled
  IF EXISTS (
    SELECT 1 FROM public.classroom_students 
    WHERE classroom_id = classroom_record.classroom_id 
    AND student_id = p_student_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'You are already enrolled in this classroom',
      'classroom_name', classroom_record.classroom_name
    );
  END IF;
  
  -- Enroll student
  INSERT INTO public.classroom_students (classroom_id, student_id)
  VALUES (classroom_record.classroom_id, p_student_id);
  
  -- Update usage count
  UPDATE public.classroom_codes 
  SET usage_count = usage_count + 1
  WHERE id = classroom_record.id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'classroom_id', classroom_record.classroom_id,
    'classroom_name', classroom_record.classroom_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
