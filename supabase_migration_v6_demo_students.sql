-- ============================================================
-- Migration v6: Demo Students Table
-- Admin-controlled demo student system for ChessHub
-- ============================================================

CREATE TABLE IF NOT EXISTS demo_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    demo_username TEXT NOT NULL UNIQUE,
    demo_password TEXT NOT NULL,
    demo_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'active', 'demo_completed', 'converted', 'expired')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    converted_student_id UUID REFERENCES student_profiles(id) ON DELETE SET NULL
);

-- Index for login lookups
CREATE INDEX IF NOT EXISTS idx_demo_students_username ON demo_students(demo_username);
CREATE INDEX IF NOT EXISTS idx_demo_students_status ON demo_students(status);

-- RLS policies
ALTER TABLE demo_students ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "admin_full_access_demo_students" ON demo_students
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- Public read for login (only active demo accounts)
CREATE POLICY "demo_login_read" ON demo_students
    FOR SELECT
    USING (status IN ('pending', 'active'));
