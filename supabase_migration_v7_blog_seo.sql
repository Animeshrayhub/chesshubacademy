-- ============================================================
-- Migration v7: Blog SEO Extensions + SEO Content Engine
-- Extends blog_posts with SEO fields and creates seo_content table
-- ============================================================

-- 1. Extend blog_posts table with SEO fields
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS keywords TEXT,
  ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'ChessHub Academy',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);

-- 2. SEO Content Engine table
CREATE TABLE IF NOT EXISTS seo_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    category TEXT,
    target_keyword TEXT,
    difficulty_level TEXT DEFAULT 'beginner'
        CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all')),
    meta_title TEXT,
    meta_description TEXT,
    featured_image TEXT,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_content_slug ON seo_content(slug);
CREATE INDEX IF NOT EXISTS idx_seo_content_category ON seo_content(category);
CREATE INDEX IF NOT EXISTS idx_seo_content_published ON seo_content(published);

-- RLS for seo_content
ALTER TABLE seo_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_seo_content" ON seo_content
    FOR SELECT
    USING (published = true);

CREATE POLICY "admin_full_access_seo_content" ON seo_content
    FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    );

-- 3. Add target_keyword to youtube_videos table for SEO matching
ALTER TABLE youtube_videos
  ADD COLUMN IF NOT EXISTS target_keyword TEXT;
