-- ============================================
-- MIGRATION V9: Fee Plans + Student Auth Support
-- ============================================
-- Run this in Supabase SQL Editor
-- Creates: site_settings table for fee plans
-- Alters: student_profiles with plan tracking fields

-- ============================================
-- 1. SITE SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access to site_settings"
    ON site_settings FOR ALL
    USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Public read for fee_plans
CREATE POLICY "Public read fee_plans"
    ON site_settings FOR SELECT
    USING (key = 'fee_plans');

-- Insert default fee plans
INSERT INTO site_settings (key, value) VALUES (
    'fee_plans',
    '[
        {"sessions": 48, "price": 23600, "classes_per_week": 2, "label": "48 Sessions"},
        {"sessions": 24, "price": 14000, "classes_per_week": 2, "label": "24 Sessions"},
        {"sessions": 12, "price": 7000, "classes_per_week": 2, "label": "12 Sessions"}
    ]'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 2. STUDENT PROFILES — ADD PLAN TRACKING
-- ============================================
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS plan_type TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS plan_price NUMERIC(10, 2);
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS sessions_completed INTEGER DEFAULT 0;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS sessions_remaining INTEGER DEFAULT 0;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed'));
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS bonus_notes TEXT;

-- ============================================
-- 3. FIX RLS — Allow admin to insert student profiles
-- ============================================
-- Drop the restrictive insert policy if it exists
DO $$
BEGIN
    DROP POLICY IF EXISTS "Students can insert own profile" ON student_profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON student_profiles;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Allow admin to insert student profiles (user_id from Edge Function)
CREATE POLICY "Admin can insert student profiles"
    ON student_profiles FOR INSERT
    WITH CHECK (
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
        OR auth.uid() = user_id
    );
