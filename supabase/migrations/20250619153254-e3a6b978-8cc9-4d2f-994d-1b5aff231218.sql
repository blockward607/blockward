
-- Create a table to store admin control panel buttons
CREATE TABLE public.admin_buttons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon text NOT NULL,
  route text NOT NULL,
  color text NOT NULL DEFAULT 'bg-blue-500',
  permissions jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_buttons ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view buttons" ON public.admin_buttons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage buttons" ON public.admin_buttons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles 
      WHERE user_id = auth.uid()
      AND access_level IN ('super_admin', 'ict_admin')
    )
  );

-- Insert default admin buttons
INSERT INTO public.admin_buttons (title, description, icon, route, color, sort_order) VALUES
('Manage Students', 'View and manage all students', 'Users', '/students', 'bg-blue-500', 1),
('Manage Teachers', 'View and manage teacher accounts', 'UserPlus', '/admin/teachers', 'bg-green-500', 2),
('Classroom Management', 'Oversee all classrooms', 'BookOpen', '/classes', 'bg-purple-500', 3),
('School Settings', 'Configure school preferences', 'School', '/school-setup', 'bg-orange-500', 4),
('System Analytics', 'View detailed analytics', 'BarChart3', '/admin/analytics', 'bg-cyan-500', 5),
('Admin Requests', 'Review pending requests', 'Shield', '/admin/requests', 'bg-red-500', 6);
