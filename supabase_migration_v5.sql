-- Migration v5: Demo requests table and improvements
-- Run this in Supabase SQL Editor

-- Demo Requests table (replaces raw Google Form embed)
CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    level TEXT DEFAULT 'beginner',
    age INTEGER,
    location TEXT,
    time_slot TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status);
CREATE INDEX IF NOT EXISTS idx_demo_requests_created ON demo_requests(created_at DESC);

-- RLS policies
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a demo request (public form)
CREATE POLICY "Anyone can create demo request" ON demo_requests
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only authenticated users with admin role can read/update/delete
CREATE POLICY "Admin can read demo requests" ON demo_requests
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

CREATE POLICY "Admin can update demo requests" ON demo_requests
    FOR UPDATE TO authenticated
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

CREATE POLICY "Admin can delete demo requests" ON demo_requests
    FOR DELETE TO authenticated
    USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE courses;
ALTER PUBLICATION supabase_realtime ADD TABLE coaches;
ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE ebooks;
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE site_content;
ALTER PUBLICATION supabase_realtime ADD TABLE youtube_videos;
ALTER PUBLICATION supabase_realtime ADD TABLE demo_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE homework_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE progress_reports;
