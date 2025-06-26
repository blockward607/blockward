
-- Drop the existing check constraint that only allows 'teacher' and 'student'
ALTER TABLE public.pending_users 
DROP CONSTRAINT IF EXISTS pending_users_role_check;

-- Create a new check constraint that allows 'teacher', 'student', and 'admin' roles
ALTER TABLE public.pending_users 
ADD CONSTRAINT pending_users_role_check 
CHECK (role IN ('teacher', 'student', 'admin'));
