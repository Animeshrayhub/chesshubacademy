-- ============================================
-- MIGRATION V11: Unified Users + Role/Auth Stabilization
-- ============================================

-- 1) Unified USERS table (public.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'coach', 'student')),
    account_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- 2) Backfill from auth.users where possible
INSERT INTO public.users (id, name, email, password_hash, role, account_id, created_at, status)
SELECT
    au.id,
    COALESCE(NULLIF(au.raw_user_meta_data->>'full_name', ''), split_part(au.email, '@', 1), 'User') AS name,
    au.email,
    'legacy$managed-by-supabase-auth' AS password_hash,
    COALESCE(NULLIF(au.raw_user_meta_data->>'role', ''), NULLIF(au.raw_app_meta_data->>'role', ''), 'student')::TEXT AS role,
    COALESCE(
        NULLIF(au.raw_user_meta_data->>'account_id', ''),
        CASE
            WHEN COALESCE(NULLIF(au.raw_user_meta_data->>'role', ''), NULLIF(au.raw_app_meta_data->>'role', ''), 'student') = 'coach'
                THEN 'CHC-' || (200 + ROW_NUMBER() OVER (ORDER BY au.created_at))
            ELSE 'CHS-' || (1000 + ROW_NUMBER() OVER (ORDER BY au.created_at))
        END
    ) AS account_id,
    au.created_at,
    'active'::TEXT
FROM auth.users au
WHERE au.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- 3) Compatibility views requested by spec
DROP VIEW IF EXISTS public.student_profile;
CREATE VIEW public.student_profile AS
SELECT
    sp.user_id,
    sp.age,
    CASE
        WHEN lower(COALESCE(sp.level, 'beginner')) = 'beginner' THEN 'Beginner'
        WHEN lower(COALESCE(sp.level, 'beginner')) = 'intermediate' THEN 'Intermediate'
        WHEN lower(COALESCE(sp.level, 'beginner')) = 'advanced' THEN 'Advanced'
        ELSE 'Master'
    END AS level,
    sp.assigned_coach_id,
    COALESCE(sp.chess_rating, 0) AS rating,
    sp.created_at::date AS joined_date
FROM student_profiles sp;

DROP VIEW IF EXISTS public.coach_profile;
CREATE VIEW public.coach_profile AS
SELECT
    c.user_id,
    c.title,
    NULL::INTEGER AS experience_years,
    c.specialization,
    c.bio,
    c.photo_url AS profile_photo
FROM coaches c;

DROP VIEW IF EXISTS public.homework;
CREATE VIEW public.homework AS
SELECT
    h.id,
    h.student_id,
    h.coach_id,
    h.title,
    h.description,
    h.submission_url AS lichess_link,
    h.assigned_at AS created_at,
    h.status
FROM homework_assignments h;

-- 3b) Sessions compatibility column required by management spec
ALTER TABLE public.sessions
    ADD COLUMN IF NOT EXISTS session_date DATE;

UPDATE public.sessions
SET session_date = date
WHERE session_date IS NULL;

CREATE OR REPLACE FUNCTION public.sync_sessions_date_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.session_date IS NULL AND NEW.date IS NOT NULL THEN
        NEW.session_date := NEW.date;
    ELSIF NEW.date IS NULL AND NEW.session_date IS NOT NULL THEN
        NEW.date := NEW.session_date;
    ELSE
        NEW.session_date := NEW.date;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_sessions_date_columns ON public.sessions;
CREATE TRIGGER trg_sync_sessions_date_columns
BEFORE INSERT OR UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.sync_sessions_date_columns();

-- 4) RLS: secure users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_admin_full ON public.users;
CREATE POLICY users_admin_full ON public.users
FOR ALL
USING (
    auth.jwt() ->> 'role' = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

DROP POLICY IF EXISTS users_self_read ON public.users;
CREATE POLICY users_self_read ON public.users
FOR SELECT
USING (id = auth.uid());

-- 5) Utility function to keep account_id generation available if needed
CREATE OR REPLACE FUNCTION public.next_account_id(p_role TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    prefix TEXT;
    start_no INTEGER;
    max_no INTEGER;
BEGIN
    IF p_role = 'coach' THEN
        prefix := 'CHC-';
        start_no := 201;
    ELSE
        prefix := 'CHS-';
        start_no := 1001;
    END IF;

    SELECT COALESCE(MAX((regexp_match(account_id, '(\d+)$'))[1]::INTEGER), start_no - 1)
    INTO max_no
    FROM public.users
    WHERE role = p_role
      AND account_id LIKE prefix || '%';

    RETURN prefix || (GREATEST(max_no + 1, start_no))::TEXT;
END;
$$;
