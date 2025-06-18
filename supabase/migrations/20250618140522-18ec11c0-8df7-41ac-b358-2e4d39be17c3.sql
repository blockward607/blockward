
-- Create admin_requests table for teachers to request admin access
CREATE TABLE public.admin_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  school_code TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Add Row Level Security
ALTER TABLE public.admin_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_requests
CREATE POLICY "Users can view their own admin requests" 
  ON public.admin_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own admin requests" 
  ON public.admin_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admins can view and update all requests
CREATE POLICY "Admins can view all admin requests"
  ON public.admin_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update admin requests"
  ON public.admin_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
