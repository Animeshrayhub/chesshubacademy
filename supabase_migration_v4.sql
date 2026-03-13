-- ============================================================
-- ChessHub Scaling Migration v4
-- Student Platform, Sessions, Training, Progress, Reports
-- ============================================================

-- 1. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    age INTEGER,
    chess_rating INTEGER DEFAULT 0,
    level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'master')),
    avatar_url TEXT,
    parent_name TEXT,
    parent_email TEXT,
    parent_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

CREATE INDEX idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_email ON student_profiles(email);

-- 2. STUDENT COURSES (enrollment)
CREATE TABLE IF NOT EXISTS student_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    course_id UUID,
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    progress_pct NUMERIC(5,2) DEFAULT 0,
    completed_at TIMESTAMPTZ,
    UNIQUE(student_id, course_id)
);

CREATE INDEX idx_student_courses_student ON student_courses(student_id);

-- 3. STUDENT PROGRESS (general tracking)
CREATE TABLE IF NOT EXISTS student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('rating', 'puzzles_solved', 'games_played', 'streak', 'lesson_completed')),
    metric_value NUMERIC NOT NULL DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_student_progress_student ON student_progress(student_id);
CREATE INDEX idx_student_progress_type ON student_progress(student_id, metric_type);
CREATE INDEX idx_student_progress_date ON student_progress(recorded_at);

-- 4. HOMEWORK ASSIGNMENTS
CREATE TABLE IF NOT EXISTS homework_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    coach_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'reviewed', 'late')),
    submission_text TEXT,
    submission_url TEXT,
    coach_feedback TEXT,
    grade TEXT,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_homework_student ON homework_assignments(student_id);
CREATE INDEX idx_homework_status ON homework_assignments(status);

-- 5. SESSIONS (class scheduling)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID,
    student_id UUID REFERENCES student_profiles(id) ON DELETE SET NULL,
    title TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration INTEGER DEFAULT 60,
    meeting_link TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sessions_student ON sessions(student_id);
CREATE INDEX idx_sessions_coach ON sessions(coach_id);
CREATE INDEX idx_sessions_date ON sessions(date);

-- 6. PUZZLE HISTORY
CREATE TABLE IF NOT EXISTS puzzle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    puzzle_id TEXT,
    puzzle_fen TEXT,
    solved BOOLEAN DEFAULT false,
    time_taken INTEGER,
    rating_change INTEGER DEFAULT 0,
    attempted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_puzzle_history_student ON puzzle_history(student_id);

-- 7. GAME ANALYSIS HISTORY
CREATE TABLE IF NOT EXISTS game_analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    pgn TEXT NOT NULL,
    opponent TEXT,
    result TEXT CHECK (result IN ('win', 'loss', 'draw')),
    accuracy NUMERIC(5,2),
    blunders INTEGER DEFAULT 0,
    mistakes INTEGER DEFAULT 0,
    inaccuracies INTEGER DEFAULT 0,
    best_moves INTEGER DEFAULT 0,
    analysis_data JSONB,
    analyzed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_game_analysis_student ON game_analysis_history(student_id);

-- 8. OPENING TRAINING PROGRESS
CREATE TABLE IF NOT EXISTS opening_training_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    opening_name TEXT NOT NULL,
    opening_eco TEXT,
    color TEXT CHECK (color IN ('white', 'black')),
    mastery_pct NUMERIC(5,2) DEFAULT 0,
    times_practiced INTEGER DEFAULT 0,
    last_practiced TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, opening_name, color)
);

CREATE INDEX idx_opening_progress_student ON opening_training_progress(student_id);

-- 9. PROGRESS REPORTS (parent reports)
CREATE TABLE IF NOT EXISTS progress_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    report_period TEXT NOT NULL,
    attendance_pct NUMERIC(5,2) DEFAULT 0,
    sessions_attended INTEGER DEFAULT 0,
    sessions_total INTEGER DEFAULT 0,
    puzzles_solved INTEGER DEFAULT 0,
    rating_start INTEGER DEFAULT 0,
    rating_end INTEGER DEFAULT 0,
    improvement_areas TEXT[],
    coach_notes TEXT,
    recommended_exercises TEXT[],
    strengths TEXT[],
    generated_by UUID,
    generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_progress_reports_student ON progress_reports(student_id);

-- 10. ANALYTICS EVENTS
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    page_path TEXT,
    user_id UUID,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_date ON analytics_events(created_at);
CREATE INDEX idx_analytics_page ON analytics_events(page_path);

-- 11. ANALYTICS DAILY AGGREGATES
CREATE TABLE IF NOT EXISTS analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    visitors INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    demo_bookings INTEGER DEFAULT 0,
    ebook_sales INTEGER DEFAULT 0,
    tournament_registrations INTEGER DEFAULT 0,
    new_signups INTEGER DEFAULT 0,
    top_pages JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_daily_date ON analytics_daily(date);

-- RLS POLICIES

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view own profile" ON student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own profile" ON student_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins full access student_profiles" ON student_profiles FOR ALL USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Service role insert student_profiles" ON student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own courses" ON student_courses FOR SELECT USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins full access student_courses" ON student_courses FOR ALL USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own progress" ON student_progress FOR SELECT USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Students insert own progress" ON student_progress FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins full access student_progress" ON student_progress FOR ALL USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

ALTER TABLE homework_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own homework" ON homework_assignments FOR SELECT USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Students submit homework" ON homework_assignments FOR UPDATE USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
) WITH CHECK (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins full access homework" ON homework_assignments FOR ALL USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own sessions" ON sessions FOR SELECT USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins full access sessions" ON sessions FOR ALL USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

ALTER TABLE puzzle_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own puzzle_history" ON puzzle_history FOR SELECT USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Students insert puzzle_history" ON puzzle_history FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins full access puzzle_history" ON puzzle_history FOR ALL USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

ALTER TABLE game_analysis_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own game_analysis" ON game_analysis_history FOR SELECT USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Students insert game_analysis" ON game_analysis_history FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins full access game_analysis" ON game_analysis_history FOR ALL USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

ALTER TABLE opening_training_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own openings" ON opening_training_progress FOR SELECT USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Students upsert openings" ON opening_training_progress FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Students update openings" ON opening_training_progress FOR UPDATE USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins full access openings" ON opening_training_progress FOR ALL USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own reports" ON progress_reports FOR SELECT USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins full access reports" ON progress_reports FOR ALL USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view analytics" ON analytics_events FOR SELECT USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access analytics_daily" ON analytics_daily FOR ALL USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_student_profiles_updated
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
