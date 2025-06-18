
-- First, remove attendance records for test students
DELETE FROM public.attendance 
WHERE student_id IN (
  SELECT id FROM public.students 
  WHERE name ILIKE '%test%' 
     OR name ILIKE '%demo%'
     OR name ILIKE '%example%'
     OR name = 'fufhfh'
     OR name = 'amirybou10'
);

-- Remove classroom_students entries for test students
DELETE FROM public.classroom_students 
WHERE student_id IN (
  SELECT id FROM public.students 
  WHERE name ILIKE '%test%' 
     OR name ILIKE '%demo%'
     OR name ILIKE '%example%'
     OR name = 'fufhfh'
     OR name = 'amirybou10'
);

-- Remove behavior records for test students
DELETE FROM public.behavior_records 
WHERE description ILIKE '%test%' 
   OR description ILIKE '%demo%'
   OR description ILIKE '%example%'
   OR student_id IN (
     SELECT id FROM public.students 
     WHERE name ILIKE '%test%' 
        OR name ILIKE '%demo%'
        OR name ILIKE '%example%'
        OR name = 'fufhfh'
        OR name = 'amirybou10'
   );

-- Remove grades for test students
DELETE FROM public.grades 
WHERE student_id IN (
  SELECT id FROM public.students 
  WHERE name ILIKE '%test%' 
     OR name ILIKE '%demo%'
     OR name ILIKE '%example%'
     OR name = 'fufhfh'
     OR name = 'amirybou10'
);

-- Finally, remove the test students
DELETE FROM public.students 
WHERE name ILIKE '%test%' 
   OR name ILIKE '%demo%'
   OR name ILIKE '%example%'
   OR name = 'fufhfh'
   OR name = 'amirybou10'
   OR points < -100000;
