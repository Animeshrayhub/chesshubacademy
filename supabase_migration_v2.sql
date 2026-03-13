-- ================================================
-- ChessHub Academy — Schema Migration v2
-- New tables for unified data architecture
-- ================================================

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    preferred_date DATE,
    preferred_time VARCHAR(20),
    message TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Coaches Table
CREATE TABLE IF NOT EXISTS coaches (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(10) DEFAULT 'FM',
    rating INTEGER DEFAULT 0,
    email VARCHAR(255),
    phone VARCHAR(50),
    specialization TEXT,
    experience VARCHAR(50),
    hourly_rate VARCHAR(20),
    availability VARCHAR(20) DEFAULT 'available',
    students INTEGER DEFAULT 0,
    total_hours INTEGER DEFAULT 0,
    rating_avg DECIMAL(3,1) DEFAULT 5.0,
    bio TEXT,
    achievements TEXT,
    languages VARCHAR(255),
    photo_url TEXT DEFAULT '👤',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    level VARCHAR(50),
    duration VARCHAR(50),
    price INTEGER DEFAULT 0,
    original_price INTEGER DEFAULT 0,
    discount INTEGER DEFAULT 0,
    rating DECIMAL(3,1) DEFAULT 5.0,
    students INTEGER DEFAULT 0,
    icon VARCHAR(10) DEFAULT '♟️',
    color VARCHAR(10) DEFAULT '#8b5cf6',
    status VARCHAR(20) DEFAULT 'active',
    description TEXT,
    curriculum JSONB DEFAULT '[]',
    features JSONB DEFAULT '[]',
    target_audience VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- Enable RLS on new tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Allow public insert bookings" ON bookings
    FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow authenticated read bookings" ON bookings
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update bookings" ON bookings
    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete bookings" ON bookings
    FOR DELETE TO authenticated USING (true);

-- Coaches policies (public read, admin write)
CREATE POLICY "Allow public read coaches" ON coaches
    FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated write coaches" ON coaches
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update coaches" ON coaches
    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete coaches" ON coaches
    FOR DELETE TO authenticated USING (true);

-- Courses policies (public read, admin write)
CREATE POLICY "Allow public read courses" ON courses
    FOR SELECT TO public USING (true);
CREATE POLICY "Allow authenticated write courses" ON courses
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update courses" ON courses
    FOR UPDATE TO authenticated USING (true);

-- Newsletter policies
CREATE POLICY "Allow public insert newsletter" ON newsletter_subscribers
    FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow authenticated read newsletter" ON newsletter_subscribers
    FOR SELECT TO authenticated USING (true);

-- Auto-update triggers for new tables
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coaches_updated_at BEFORE UPDATE ON coaches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
