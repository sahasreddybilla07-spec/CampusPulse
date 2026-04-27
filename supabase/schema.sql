-- ============================================================
--  CampusPulse — Full Database Schema
--  Run this entire file in Supabase SQL Editor
-- ============================================================

-- ── 1. Unified profiles table ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Core identity (all roles)
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL DEFAULT '',
  email                   TEXT UNIQUE NOT NULL DEFAULT '',
  role                    TEXT NOT NULL DEFAULT 'student'
                            CHECK (role IN ('student','incharge','admin')),
  phone                   TEXT,
  profile_pic_url         TEXT,
  is_active               BOOLEAN NOT NULL DEFAULT TRUE,
  password_ref            TEXT,          -- plain-text ref for admin visibility
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Student fields
  roll_no                 TEXT UNIQUE,   -- e.g. 1601-21-748-041
  branch                  TEXT,          -- CSE | ECE | MECH | ...
  year                    TEXT,          -- 1st Year | 2nd Year | ...
  section                 TEXT,          -- A | B | C
  hostel_block            TEXT,
  hostel_room             TEXT,

  -- InCharge fields
  employee_id             TEXT UNIQUE,   -- IC-2024-001 (auto-generated)
  designation             TEXT,          -- e.g. Hostel Warden
  assigned_block          TEXT,          -- Block A ... Block N
  password_reset_required BOOLEAN DEFAULT FALSE,

  -- Admin fields
  admin_level             TEXT DEFAULT 'super'
);

-- ── 2. Complaints ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.complaints (
  id          TEXT PRIMARY KEY,          -- CP-001 format
  student_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  incharge_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT,                      -- Maintenance | Infrastructure | Hostel | Academics
  block       TEXT,
  floor       TEXT,
  priority    TEXT NOT NULL DEFAULT 'Medium'
                CHECK (priority IN ('High','Medium','Low')),
  status      TEXT NOT NULL DEFAULT 'Pending'
                CHECK (status IN ('Pending','In Progress','Resolved')),
  sentiment   TEXT CHECK (sentiment IN ('Negative','Neutral','Positive')),
  anonymous   BOOLEAN NOT NULL DEFAULT FALSE,
  image_url   TEXT,
  votes       INT NOT NULL DEFAULT 0,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Notifications ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT CHECK (type IN ('update','resolved','info','warning')),
  message    TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Feedback (student rates incharge) ─────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incharge_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  complaint_id TEXT REFERENCES public.complaints(id) ON DELETE SET NULL,
  rating       INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  anonymous    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. Auto-create profile on auth signup ────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, name, roll_no, password_ref)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'roll_no', NULL),
    COALESCE(NEW.raw_user_meta_data->>'password_ref', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 6. Updated_at auto-stamp ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_complaints_updated ON public.complaints;
CREATE TRIGGER trg_complaints_updated
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 7. Analytics RPC ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_analytics_summary()
RETURNS JSON LANGUAGE sql STABLE AS $$
  SELECT json_build_object(
    'total',      COUNT(*),
    'resolved',   COUNT(*) FILTER (WHERE status = 'Resolved'),
    'pending',    COUNT(*) FILTER (WHERE status = 'Pending'),
    'inProgress', COUNT(*) FILTER (WHERE status = 'In Progress'),
    'avgDays',    ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400)::numeric, 1),
    'byCategory', (
      SELECT json_object_agg(category, cnt)
      FROM (SELECT category, COUNT(*) cnt FROM public.complaints GROUP BY category) c
    ),
    'byPriority', (
      SELECT json_object_agg(priority, cnt)
      FROM (SELECT priority, COUNT(*) cnt FROM public.complaints GROUP BY priority) p
    ),
    'byBlock', (
      SELECT json_agg(json_build_object('block', block, 'total', cnt, 'resolved', res))
      FROM (
        SELECT block,
               COUNT(*) cnt,
               COUNT(*) FILTER (WHERE status='Resolved') res
        FROM public.complaints GROUP BY block ORDER BY cnt DESC
      ) b
    ),
    'byStatus', (
      SELECT json_object_agg(status, cnt)
      FROM (SELECT status, COUNT(*) cnt FROM public.complaints GROUP BY status) s
    ),
    'byDay', (
      SELECT json_agg(json_build_object('day', to_char(g.d, 'Dy'), 'raised', COALESCE(r.cnt, 0), 'resolved', COALESCE(rs.cnt, 0)) ORDER BY g.d)
      FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') AS g(d)
      LEFT JOIN (SELECT created_at::date dt, COUNT(*) cnt FROM public.complaints GROUP BY dt) r ON r.dt = g.d::date
      LEFT JOIN (SELECT updated_at::date dt, COUNT(*) cnt FROM public.complaints WHERE status='Resolved' GROUP BY dt) rs ON rs.dt = g.d::date
    )
  )
  FROM public.complaints;
$$;

-- ── 7b. Create In-Charge RPC (replaces Edge Function) ────────
CREATE OR REPLACE FUNCTION public.create_incharge(
  p_name TEXT,
  p_email TEXT,
  p_block TEXT,
  p_designation TEXT DEFAULT '',
  p_phone TEXT DEFAULT ''
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_uid UUID;
  temp_password TEXT;
  emp_id TEXT;
  emp_count INT;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RETURN json_build_object('error', 'An account with this email already exists');
  END IF;

  -- Generate temp password and employee ID
  temp_password := 'IC@' || substr(md5(random()::text), 1, 8);
  SELECT COUNT(*) + 1 INTO emp_count FROM public.profiles WHERE role = 'incharge';
  emp_id := 'IC-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(emp_count::text, 3, '0');

  -- Create auth user
  new_uid := gen_random_uuid();
  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_uid, 'authenticated', 'authenticated', p_email,
    crypt(temp_password, gen_salt('bf')),
    NOW(),
    json_build_object('name', p_name, 'role', 'incharge', 'password_ref', temp_password)::jsonb,
    NOW(), NOW(), '', ''
  );

  -- Create identity row
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), new_uid,
    json_build_object('sub', new_uid::text, 'email', p_email)::jsonb,
    'email', new_uid::text,
    NOW(), NOW(), NOW()
  );

  -- Update the auto-created profile (from trigger)
  INSERT INTO public.profiles (id, name, email, role, employee_id, designation, assigned_block, phone, password_ref, password_reset_required)
  VALUES (new_uid, p_name, p_email, 'incharge', emp_id, p_designation, p_block, p_phone, temp_password, TRUE)
  ON CONFLICT (id) DO UPDATE SET
    name = p_name,
    role = 'incharge',
    employee_id = emp_id,
    designation = p_designation,
    assigned_block = p_block,
    phone = p_phone,
    password_ref = temp_password,
    password_reset_required = TRUE;

  RETURN json_build_object(
    'email', p_email,
    'tempPassword', temp_password,
    'employeeId', emp_id,
    'name', p_name,
    'block', p_block
  );
END;
$$;

-- ── 8. RLS (enable but open for dev — tighten before production) ──
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback      ENABLE ROW LEVEL SECURITY;

-- Open policies (dev mode — everyone authenticated can read/write)
DO $$ BEGIN
  -- profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_open') THEN
    CREATE POLICY profiles_open ON public.profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- complaints
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='complaints' AND policyname='complaints_open') THEN
    CREATE POLICY complaints_open ON public.complaints FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- notifications
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='notif_open') THEN
    CREATE POLICY notif_open ON public.notifications FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- feedback
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='feedback' AND policyname='feedback_open') THEN
    CREATE POLICY feedback_open ON public.feedback FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
