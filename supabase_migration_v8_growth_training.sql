-- ============================================================
-- MIGRATION V8: Growth Engine + Advanced Training Systems
-- ============================================================

-- ============================================================
-- GROWTH ENGINE TABLES
-- ============================================================

-- STEP 1: Unified Lead Capture Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT NOT NULL DEFAULT 'demo_form',
    status TEXT NOT NULL DEFAULT 'new',
    notes TEXT,
    referral_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage leads" ON leads FOR ALL USING (
    EXISTS (SELECT 1 FROM student_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- STEP 3: Referral Codes Table
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES student_profiles(id),
    code TEXT UNIQUE NOT NULL,
    referrals_count INT DEFAULT 0,
    rewards JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own referral code" ON referral_codes FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Public can read codes by code" ON referral_codes FOR SELECT USING (true);
CREATE POLICY "Admins manage referral codes" ON referral_codes FOR ALL USING (
    EXISTS (SELECT 1 FROM student_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- STEP 4: Tournament improvements
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS max_players INT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS registered_players INT DEFAULT 0;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS tournament_type TEXT DEFAULT 'open';
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS rating_limit INT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS lichess_id TEXT;

-- STEP 6: Student Activity Tracking
CREATE TABLE IF NOT EXISTS student_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES student_profiles(id),
    sessions_attended INT DEFAULT 0,
    puzzles_solved INT DEFAULT 0,
    games_played INT DEFAULT 0,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    streak INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id)
);

ALTER TABLE student_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own activity" ON student_activity FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Admins manage activity" ON student_activity FOR ALL USING (
    EXISTS (SELECT 1 FROM student_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "System can upsert activity" ON student_activity FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students update own activity" ON student_activity FOR UPDATE USING (student_id = auth.uid());

-- ============================================================
-- TRAINING SYSTEM TABLES
-- ============================================================

-- SYSTEM 1: Puzzle Engine
CREATE TABLE IF NOT EXISTS puzzles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fen TEXT NOT NULL,
    moves TEXT NOT NULL,
    rating INT DEFAULT 1500,
    themes TEXT,
    source TEXT DEFAULT 'custom',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read puzzles" ON puzzles FOR SELECT USING (true);
CREATE POLICY "Admins manage puzzles" ON puzzles FOR ALL USING (
    EXISTS (SELECT 1 FROM student_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE TABLE IF NOT EXISTS puzzle_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES student_profiles(id),
    puzzle_id UUID REFERENCES puzzles(id),
    solved BOOLEAN DEFAULT false,
    time_spent INT DEFAULT 0,
    rating_change INT DEFAULT 0,
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE puzzle_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own attempts" ON puzzle_attempts FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students insert own attempts" ON puzzle_attempts FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Admins read all attempts" ON puzzle_attempts FOR SELECT USING (
    EXISTS (SELECT 1 FROM student_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- SYSTEM 3 & 4: Live Classroom / Session enhancements
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'regular';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS actual_start TIMESTAMPTZ;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS actual_end TIMESTAMPTZ;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS board_fen TEXT DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS room_id TEXT;

-- SYSTEM 8: Reschedule history
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS rescheduled_from TIMESTAMPTZ;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS reschedule_reason TEXT;
