
-- Fix the infinite recursion issue in admin_profiles RLS policies
-- Drop the problematic policies first
DROP POLICY IF EXISTS "School admins can manage admin profiles in their school" ON public.admin_profiles;
DROP POLICY IF EXISTS "Users can view their own admin profile" ON public.admin_profiles;

-- Create simpler, non-recursive policies for admin_profiles
CREATE POLICY "Users can view their own admin profile" ON public.admin_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own admin profile" ON public.admin_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own admin profile" ON public.admin_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Fix schools policies to avoid recursion
DROP POLICY IF EXISTS "School admins can manage their schools" ON public.schools;

CREATE POLICY "School creators can manage their schools" ON public.schools
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admin profiles can view their schools" ON public.schools
  FOR SELECT USING (
    id IN (
      SELECT school_id FROM public.admin_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Fix other admin-related policies to be simpler
DROP POLICY IF EXISTS "School admins can manage year groups" ON public.year_groups;
DROP POLICY IF EXISTS "School admins can manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "School admins can view audit logs" ON public.audit_logs;

CREATE POLICY "School members can manage year groups" ON public.year_groups
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM public.admin_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "School members can manage subjects" ON public.subjects
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM public.admin_profiles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "School members can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.admin_profiles 
      WHERE user_id = auth.uid()
    )
  );
