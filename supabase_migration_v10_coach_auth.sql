-- Migration v10: Coach Auth & Student-Coach Assignment
-- Adds user_id to coaches table for Supabase auth linking
-- Adds assigned_coach_id to student_profiles for coach-student relationships

-- 1. Add user_id column to coaches table (links to auth.users)
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_coaches_user_id ON coaches(user_id) WHERE user_id IS NOT NULL;

-- 2. Add assigned_coach_id to student_profiles
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS assigned_coach_id BIGINT REFERENCES coaches(id);
CREATE INDEX IF NOT EXISTS idx_students_assigned_coach ON student_profiles(assigned_coach_id) WHERE assigned_coach_id IS NOT NULL;

-- 3. RLS policies for coaches table
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with coaches
CREATE POLICY IF NOT EXISTS "admin_manage_coaches" ON coaches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.raw_user_meta_data->>'role' = 'admin')
        )
    );

-- Coaches can view and update their own record
CREATE POLICY IF NOT EXISTS "coach_view_own" ON coaches
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "coach_update_own" ON coaches
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Public can view coaches (for website coach profiles)
CREATE POLICY IF NOT EXISTS "public_view_coaches" ON coaches
    FOR SELECT USING (true);

-- 4. Allow coaches to view their assigned students
CREATE POLICY IF NOT EXISTS "coach_view_assigned_students" ON student_profiles
    FOR SELECT USING (
        assigned_coach_id IN (
            SELECT id FROM coaches WHERE user_id = auth.uid()
        )
    );

-- 5. Allow coaches to view sessions assigned to them
CREATE POLICY IF NOT EXISTS "coach_view_own_sessions" ON sessions
    FOR SELECT USING (
        coach_id IN (
            SELECT id FROM coaches WHERE user_id = auth.uid()
        )
    );

-- Allow coaches to update their own sessions (meeting link, notes, status)
CREATE POLICY IF NOT EXISTS "coach_update_own_sessions" ON sessions
    FOR UPDATE USING (
        coach_id IN (
            SELECT id FROM coaches WHERE user_id = auth.uid()
        )
    );

-- 6. Allow coaches to manage homework for their students
CREATE POLICY IF NOT EXISTS "coach_manage_homework" ON homework_assignments
    FOR ALL USING (
        coach_id IN (
            SELECT id FROM coaches WHERE user_id = auth.uid()
        )
    );

-- 7. Enable realtime for coaches table
ALTER PUBLICATION supabase_realtime ADD TABLE coaches;
