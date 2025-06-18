
-- Remove all test/demo behavior records
DELETE FROM public.behavior_records 
WHERE description ILIKE '%test%' 
   OR description ILIKE '%demo%'
   OR description ILIKE '%example%'
   OR description ILIKE '%sample%'
   OR points < -1000;

-- Remove any remaining behavior records that seem like test data
DELETE FROM public.behavior_records 
WHERE created_at < '2024-01-01'
   OR student_id IN (
     SELECT id FROM public.students 
     WHERE name ILIKE '%test%' 
        OR name ILIKE '%demo%'
        OR name ILIKE '%example%'
        OR name = 'Sample Student'
   );
