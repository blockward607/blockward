
-- Remove test/demo students and their associated data
DELETE FROM public.attendance 
WHERE student_id IN (
  SELECT id FROM public.students 
  WHERE name IN ('Arya asdasdasd', 'dfkd', 'dsad dsafasfaf', 'fafsafafs', 'fuiwreh', 'jksd', 'qwegew', 'zhixuanlucasfeng')
     OR name ILIKE '%test%' 
     OR name ILIKE '%demo%'
     OR name ILIKE '%example%'
     OR name ILIKE '%sample%'
);

-- Remove classroom_students entries for test students
DELETE FROM public.classroom_students 
WHERE student_id IN (
  SELECT id FROM public.students 
  WHERE name IN ('Arya asdasdasd', 'dfkd', 'dsad dsafasfaf', 'fafsafafs', 'fuiwreh', 'jksd', 'qwegew', 'zhixuanlucasfeng')
     OR name ILIKE '%test%' 
     OR name ILIKE '%demo%'
     OR name ILIKE '%example%'
     OR name ILIKE '%sample%'
);

-- Remove behavior records for test students
DELETE FROM public.behavior_records 
WHERE student_id IN (
  SELECT id FROM public.students 
  WHERE name IN ('Arya asdasdasd', 'dfkd', 'dsad dsafasfaf', 'fafsafafs', 'fuiwreh', 'jksd', 'qwegew', 'zhixuanlucasfeng')
     OR name ILIKE '%test%' 
     OR name ILIKE '%demo%'
     OR name ILIKE '%example%'
     OR name ILIKE '%sample%'
);

-- Remove grades for test students
DELETE FROM public.grades 
WHERE student_id IN (
  SELECT id FROM public.students 
  WHERE name IN ('Arya asdasdasd', 'dfkd', 'dsad dsafasfaf', 'fafsafafs', 'fuiwreh', 'jksd', 'qwegew', 'zhixuanlucasfeng')
     OR name ILIKE '%test%' 
     OR name ILIKE '%demo%'
     OR name ILIKE '%example%'
     OR name ILIKE '%sample%'
);

-- Remove student achievements for test students
DELETE FROM public.student_achievements 
WHERE student_id IN (
  SELECT id FROM public.students 
  WHERE name IN ('Arya asdasdasd', 'dfkd', 'dsad dsafasfaf', 'fafsafafs', 'fuiwreh', 'jksd', 'qwegew', 'zhixuanlucasfeng')
     OR name ILIKE '%test%' 
     OR name ILIKE '%demo%'
     OR name ILIKE '%example%'
     OR name ILIKE '%sample%'
);

-- Finally, remove the test students themselves
DELETE FROM public.students 
WHERE name IN ('Arya asdasdasd', 'dfkd', 'dsad dsafasfaf', 'fafsafafs', 'fuiwreh', 'jksd', 'qwegew', 'zhixuanlucasfeng')
   OR name ILIKE '%test%' 
   OR name ILIKE '%demo%'
   OR name ILIKE '%example%'
   OR name ILIKE '%sample%'
   OR points < -100000;
