-- ============================================================
--  CampusPulse — Admin Account Seed (fully idempotent)
--  Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Clean slate: delete old admin (cascades to profile + identities)
DELETE FROM auth.users WHERE email = 'admin@campuspulse.edu';
DELETE FROM public.profiles WHERE email = 'admin@campuspulse.edu';

DO $$
DECLARE
  admin_uid UUID;
BEGIN
  admin_uid := gen_random_uuid();

  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_uid,
    'authenticated',
    'authenticated',
    'admin@campuspulse.edu',
    crypt('Admin@123', gen_salt('bf')),
    NOW(),
    '{"name":"Campus Admin","role":"admin","password_ref":"Admin@123"}'::jsonb,
    NOW(),
    NOW(),
    '',
    ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    admin_uid,
    json_build_object('sub', admin_uid::text, 'email', 'admin@campuspulse.edu')::jsonb,
    'email',
    admin_uid::text,
    NOW(), NOW(), NOW()
  );

  -- Use ON CONFLICT because the handle_new_user trigger already created a row
  INSERT INTO public.profiles (id, name, email, role, password_ref, admin_level)
  VALUES (admin_uid, 'Campus Admin', 'admin@campuspulse.edu', 'admin', 'Admin@123', 'super')
  ON CONFLICT (id) DO UPDATE SET
    name = 'Campus Admin',
    role = 'admin',
    password_ref = 'Admin@123',
    admin_level = 'super';

END $$;
