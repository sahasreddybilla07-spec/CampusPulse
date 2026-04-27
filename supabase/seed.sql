-- ============================================================
--  CampusPulse — Demo Data Seed (fully idempotent)
--  Run AFTER schema.sql + seed_admin.sql in Supabase SQL Editor
--  Safe to re-run — deletes and recreates all seed accounts
-- ============================================================

-- ── Step 1: Nuke old seed accounts completely ────────────────
DELETE FROM auth.users WHERE email IN (
  'student@campuspulse.edu',
  'incharge@campuspulse.edu',
  'rahul@campuspulse.edu',
  'priya@campuspulse.edu',
  'kumar@campuspulse.edu',
  'divya@campuspulse.edu'
);
DELETE FROM public.profiles WHERE email IN (
  'student@campuspulse.edu',
  'incharge@campuspulse.edu',
  'rahul@campuspulse.edu',
  'priya@campuspulse.edu',
  'kumar@campuspulse.edu',
  'divya@campuspulse.edu'
);

-- ── Step 2: Create fresh accounts ────────────────────────────
DO $$
DECLARE
  uid UUID;
BEGIN

  -- ── Demo Student ───────────────────────────────────────────
  uid := gen_random_uuid();
  INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','student@campuspulse.edu',crypt('Student@123',gen_salt('bf')),NOW(),'{"name":"Demo Student","role":"student","roll_no":"160122733001","password_ref":"Student@123"}'::jsonb,NOW(),NOW(),'','');
  INSERT INTO auth.identities (id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
  VALUES (gen_random_uuid(),uid,json_build_object('sub',uid::text,'email','student@campuspulse.edu')::jsonb,'email',uid::text,NOW(),NOW(),NOW());
  INSERT INTO public.profiles (id,name,email,role,roll_no,branch,year,section,hostel_block,hostel_room,phone,password_ref)
  VALUES (uid,'Demo Student','student@campuspulse.edu','student','160122733001','CSE','3rd Year','A','Block A','301','9876543210','Student@123')
  ON CONFLICT (id) DO UPDATE SET name='Demo Student',role='student',roll_no='160122733001',branch='CSE',year='3rd Year',section='A',hostel_block='Block A',hostel_room='301',phone='9876543210',password_ref='Student@123';

  -- ── Demo In-Charge ─────────────────────────────────────────
  uid := gen_random_uuid();
  INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','incharge@campuspulse.edu',crypt('Incharge@123',gen_salt('bf')),NOW(),'{"name":"Demo In-Charge","role":"incharge","password_ref":"Incharge@123"}'::jsonb,NOW(),NOW(),'','');
  INSERT INTO auth.identities (id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
  VALUES (gen_random_uuid(),uid,json_build_object('sub',uid::text,'email','incharge@campuspulse.edu')::jsonb,'email',uid::text,NOW(),NOW(),NOW());
  INSERT INTO public.profiles (id,name,email,role,employee_id,designation,assigned_block,phone,password_ref,password_reset_required)
  VALUES (uid,'Demo In-Charge','incharge@campuspulse.edu','incharge','IC-DEMO-001','Block Warden','Block A','9876543220','Incharge@123',FALSE)
  ON CONFLICT (id) DO UPDATE SET name='Demo In-Charge',role='incharge',employee_id='IC-DEMO-001',designation='Block Warden',assigned_block='Block A',phone='9876543220',password_ref='Incharge@123',password_reset_required=FALSE;

  -- ── Rahul Sharma (student) ─────────────────────────────────
  uid := gen_random_uuid();
  INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','rahul@campuspulse.edu',crypt('Student@123',gen_salt('bf')),NOW(),'{"name":"Rahul Sharma","role":"student","roll_no":"1601-21-748-001","password_ref":"Student@123"}'::jsonb,NOW(),NOW(),'','');
  INSERT INTO auth.identities (id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
  VALUES (gen_random_uuid(),uid,json_build_object('sub',uid::text,'email','rahul@campuspulse.edu')::jsonb,'email',uid::text,NOW(),NOW(),NOW());
  INSERT INTO public.profiles (id,name,email,role,roll_no,branch,year,section,hostel_block,hostel_room,phone,password_ref)
  VALUES (uid,'Rahul Sharma','rahul@campuspulse.edu','student','1601-21-748-001','CSE','3rd Year','A','Block A','204','9876543211','Student@123')
  ON CONFLICT (id) DO UPDATE SET name='Rahul Sharma',role='student',roll_no='1601-21-748-001',branch='CSE',year='3rd Year',section='A',hostel_block='Block A',hostel_room='204',phone='9876543211',password_ref='Student@123';

  -- ── Priya Reddy (student) ──────────────────────────────────
  uid := gen_random_uuid();
  INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','priya@campuspulse.edu',crypt('Student@123',gen_salt('bf')),NOW(),'{"name":"Priya Reddy","role":"student","roll_no":"1601-21-748-002","password_ref":"Student@123"}'::jsonb,NOW(),NOW(),'','');
  INSERT INTO auth.identities (id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
  VALUES (gen_random_uuid(),uid,json_build_object('sub',uid::text,'email','priya@campuspulse.edu')::jsonb,'email',uid::text,NOW(),NOW(),NOW());
  INSERT INTO public.profiles (id,name,email,role,roll_no,branch,year,section,hostel_block,hostel_room,phone,password_ref)
  VALUES (uid,'Priya Reddy','priya@campuspulse.edu','student','1601-21-748-002','ECE','2nd Year','B','Block C','312','9876543212','Student@123')
  ON CONFLICT (id) DO UPDATE SET name='Priya Reddy',role='student',roll_no='1601-21-748-002',branch='ECE',year='2nd Year',section='B',hostel_block='Block C',hostel_room='312',phone='9876543212',password_ref='Student@123';

  -- ── Dr. Kumar (incharge) ───────────────────────────────────
  uid := gen_random_uuid();
  INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','kumar@campuspulse.edu',crypt('InCharge@123',gen_salt('bf')),NOW(),'{"name":"Dr. Kumar","role":"incharge","password_ref":"InCharge@123"}'::jsonb,NOW(),NOW(),'','');
  INSERT INTO auth.identities (id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
  VALUES (gen_random_uuid(),uid,json_build_object('sub',uid::text,'email','kumar@campuspulse.edu')::jsonb,'email',uid::text,NOW(),NOW(),NOW());
  INSERT INTO public.profiles (id,name,email,role,employee_id,designation,assigned_block,phone,password_ref,password_reset_required)
  VALUES (uid,'Dr. Kumar','kumar@campuspulse.edu','incharge','IC-2024-003','Block In-Charge','Block B','9876543221','InCharge@123',FALSE)
  ON CONFLICT (id) DO UPDATE SET name='Dr. Kumar',role='incharge',employee_id='IC-2024-003',designation='Block In-Charge',assigned_block='Block B',phone='9876543221',password_ref='InCharge@123',password_reset_required=FALSE;

END $$;

-- ── Step 3: Sample Complaints ────────────────────────────────
INSERT INTO public.complaints (id, student_id, title, description, category, block, floor, priority, status, date, created_at)
SELECT 'CP-001', (SELECT id FROM auth.users WHERE email='student@campuspulse.edu'),
       'Water leakage in washroom', 'There is continuous water leakage from the ceiling of the 3rd floor washroom in Block A. The floor is always wet and slippery.',
       'Maintenance', 'Block A', '3rd Floor', 'High', 'Pending', CURRENT_DATE - 2, NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM public.complaints WHERE id='CP-001');

INSERT INTO public.complaints (id, student_id, title, description, category, block, floor, priority, status, date, created_at)
SELECT 'CP-002', (SELECT id FROM auth.users WHERE email='student@campuspulse.edu'),
       'Broken window in common room', 'The window glass in the Block A common room is broken. Wind and rain are entering the room.',
       'Infrastructure', 'Block A', '1st Floor', 'Medium', 'In Progress', CURRENT_DATE - 5, NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM public.complaints WHERE id='CP-002');

INSERT INTO public.complaints (id, student_id, title, description, category, block, floor, priority, status, date, created_at)
SELECT 'CP-003', (SELECT id FROM auth.users WHERE email='rahul@campuspulse.edu'),
       'WiFi not working in hostel rooms', 'WiFi has been down in Block A rooms 301-310 for the past 3 days.',
       'Infrastructure', 'Block A', '3rd Floor', 'High', 'Resolved', CURRENT_DATE - 7, NOW() - INTERVAL '7 days'
WHERE NOT EXISTS (SELECT 1 FROM public.complaints WHERE id='CP-003');

INSERT INTO public.complaints (id, student_id, title, description, category, block, floor, priority, status, date, created_at)
SELECT 'CP-004', (SELECT id FROM auth.users WHERE email='priya@campuspulse.edu'),
       'Mess food quality issues', 'The food quality in the mess hall has deteriorated significantly. Multiple students have reported stomach issues.',
       'Hostel', 'Block C', 'Ground Floor', 'High', 'Pending', CURRENT_DATE - 1, NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM public.complaints WHERE id='CP-004');

INSERT INTO public.complaints (id, student_id, title, description, category, block, floor, priority, status, date, created_at)
SELECT 'CP-005', (SELECT id FROM auth.users WHERE email='rahul@campuspulse.edu'),
       'Classroom projector malfunction', 'The projector in Room 201, Block A has been malfunctioning for a week.',
       'Academics', 'Block A', '2nd Floor', 'Medium', 'Pending', CURRENT_DATE, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.complaints WHERE id='CP-005');
