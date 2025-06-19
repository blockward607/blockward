
-- Delete all existing behavior records to clean up pre-populated data
DELETE FROM public.behavior_records;

-- Reset any student points that might have been affected by behavior records
UPDATE public.students SET points = 0 WHERE points != 0;

-- Also clean up any test behavior categories if they exist
DELETE FROM public.behavior_categories 
WHERE name ILIKE '%test%' 
   OR name ILIKE '%demo%' 
   OR name ILIKE '%sample%';
