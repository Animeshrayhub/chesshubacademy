-- =============================================
-- ChessHub Academy — Product Expansion Migration
-- Version 3.0
-- =============================================

-- =============================================
-- 1. EBOOKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS ebooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) DEFAULT 0,
    cover_image TEXT,
    drive_link TEXT,
    preview_images JSONB DEFAULT '[]'::jsonb,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ebooks" ON ebooks
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage ebooks" ON ebooks
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- =============================================
-- 2. EBOOK ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS ebook_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    payment_screenshot TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ebook_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create ebook orders" ON ebook_orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own ebook orders" ON ebook_orders
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage ebook orders" ON ebook_orders
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

CREATE INDEX idx_ebook_orders_status ON ebook_orders(status);

-- =============================================
-- 3. TOURNAMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ,
    entry_fee NUMERIC(10, 2) DEFAULT 0,
    registration_deadline TIMESTAMPTZ,
    result_link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournaments" ON tournaments
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage tournaments" ON tournaments
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- =============================================
-- 4. TOURNAMENT REGISTRATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tournament_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    payment_screenshot TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create registrations" ON tournament_registrations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read registrations" ON tournament_registrations
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage registrations" ON tournament_registrations
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

CREATE INDEX idx_tournament_registrations_status ON tournament_registrations(status);

-- =============================================
-- 5. REFERRALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_user_id UUID,
    referred_email TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'enrolled')),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referrals" ON referrals
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create referrals" ON referrals
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage referrals" ON referrals
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- =============================================
-- 6. BLOG POSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    featured_image TEXT,
    meta_title TEXT,
    meta_description TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blogs" ON blog_posts
    FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage blogs" ON blog_posts
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- =============================================
-- 7. SITE CONTENT TABLE (CMS)
-- =============================================
CREATE TABLE IF NOT EXISTS site_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type TEXT NOT NULL,
    content_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active content" ON site_content
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage content" ON site_content
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

CREATE INDEX idx_site_content_type ON site_content(content_type);

-- =============================================
-- 8. YOUTUBE VIDEOS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS youtube_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    video_id TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE youtube_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active videos" ON youtube_videos
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage videos" ON youtube_videos
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- =============================================
-- TRIGGERS for updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_site_content
    BEFORE UPDATE ON site_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
