-- ============================================================================
-- SMARTB DATABASE SCHEMA
-- Created based on code analysis to match exactly what the application expects
-- Note: Achievement mechanism excluded as requested
-- ============================================================================

-- ============================================================================
-- CLEANUP - DROP ALL EXISTING TABLES AND FUNCTIONS
-- ============================================================================

-- Drop all views first (to avoid dependency issues)
DROP VIEW IF EXISTS community_posts_view CASCADE;

-- Drop all tables (with CASCADE to handle foreign key dependencies)
DROP TABLE IF EXISTS community_likes CASCADE;
DROP TABLE IF EXISTS community_comments CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS sputum_collection_schedule CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS point_transactions CASCADE;
DROP TABLE IF EXISTS medication_logs CASCADE;
DROP TABLE IF EXISTS daily_inputs CASCADE;
DROP TABLE IF EXISTS user_dashboard CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop achievement tables if they exist (even though not used)
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS create_user(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS create_user_profile(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT) CASCADE;
DROP FUNCTION IF EXISTS verify_user_password(VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS schedule_sputum_reminders(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_post_like_count(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_post_comment_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS award_community_points(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop indexes (they will be recreated with tables)
-- Note: Indexes are automatically dropped when tables are dropped

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- MAIN TABLES
-- ============================================================================

-- Users table (phone-only authentication, no Supabase auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL, -- Changed from email to phone as primary identifier
    full_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    date_of_birth VARCHAR(10), -- Stored as string YYYY-MM-DD
    gender VARCHAR(10),
    national_id VARCHAR(50),
    avatar_url TEXT,
    notification_settings JSONB DEFAULT '{"medication": true, "sputum": true, "community": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (medical and treatment information)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    treatment_start_date VARCHAR(10) NOT NULL, -- Stored as string YYYY-MM-DD
    treatment_phase VARCHAR(50) DEFAULT 'Intensive',
    current_day INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_data_input_date VARCHAR(10), -- Stored as string YYYY-MM-DD
    health_facility VARCHAR(255),
    doctor_name VARCHAR(255),
    tb_type VARCHAR(50),
    medication_combination VARCHAR(100),
    comorbidities TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User dashboard table (for dashboard data and statistics)
CREATE TABLE user_dashboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    current_day INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    treatment_phase VARCHAR(50) DEFAULT 'Intensive',
    last_input_date VARCHAR(10), -- Stored as string YYYY-MM-DD
    achievements_unlocked JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Daily inputs table (patient daily data)
CREATE TABLE daily_inputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    input_date VARCHAR(10) NOT NULL, -- Stored as string YYYY-MM-DD
    medication_taken BOOLEAN NOT NULL DEFAULT false,
    medication_time TIME,
    symptoms TEXT[] DEFAULT '{}',
    cough_description TEXT[] DEFAULT '{}',
    activities TEXT[] DEFAULT '{}',
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
    mental_health_symptoms TEXT[] DEFAULT '{}',
    other_activities TEXT,
    points_earned INTEGER DEFAULT 0,
    is_complete BOOLEAN DEFAULT false,
    is_on_time BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, input_date)
);

-- Medication logs table
CREATE TABLE medication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_input_id UUID REFERENCES daily_inputs(id) ON DELETE CASCADE,
    medication_name VARCHAR(255),
    dosage VARCHAR(100),
    taken_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Point transactions table (for point tracking)
CREATE TABLE point_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_input_id UUID REFERENCES daily_inputs(id) ON DELETE SET NULL,
    points INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sputum collection schedule table
CREATE TABLE sputum_collection_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    collection_date VARCHAR(10) NOT NULL, -- Stored as string YYYY-MM-DD
    collection_type VARCHAR(50) NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community posts table
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    post_type VARCHAR(50) NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT true,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community comments table
CREATE TABLE community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community likes table
CREATE TABLE community_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id),
    CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Community posts view (with author information)
CREATE VIEW community_posts_view AS
SELECT 
    cp.id,
    cp.title,
    cp.content,
    cp.post_type,
    cp.is_anonymous,
    cp.likes_count,
    cp.comments_count,
    cp.created_at,
    CASE 
        WHEN cp.is_anonymous THEN 'Anonymous User'
        ELSE u.full_name
    END as author_name,
    CASE 
        WHEN cp.is_anonymous THEN NULL
        ELSE u.avatar_url
    END as author_avatar
FROM community_posts cp
JOIN users u ON cp.user_id = u.id
WHERE cp.is_approved = true
ORDER BY cp.created_at DESC;

-- Note: Since achievements mechanism is excluded per user request,
-- the user_achievements_view referenced in code will not be created
-- This may require code modifications to handle missing achievement features

-- ============================================================================
-- FUNCTIONS/STORED PROCEDURES
-- ============================================================================

-- Function to create a new user (phone-only)
CREATE OR REPLACE FUNCTION create_user(
    p_id UUID,
    p_phone VARCHAR,
    p_full_name VARCHAR DEFAULT '',
    p_nickname VARCHAR DEFAULT NULL,
    p_date_of_birth VARCHAR DEFAULT NULL,
    p_gender VARCHAR DEFAULT '',
    p_national_id VARCHAR DEFAULT '',
    p_password VARCHAR DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO users (
        id, phone, full_name, nickname, 
        date_of_birth, gender, national_id
    ) VALUES (
        p_id, p_phone, p_full_name, p_nickname,
        p_date_of_birth, p_gender, p_national_id
    );
    -- Note: Password parameter is included for compatibility but not stored
    -- Implement your own password hashing and storage if needed
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile
CREATE OR REPLACE FUNCTION create_user_profile(
    p_user_id UUID,
    p_treatment_start_date VARCHAR,
    p_health_facility VARCHAR DEFAULT NULL,
    p_doctor_name VARCHAR DEFAULT NULL,
    p_tb_type VARCHAR DEFAULT NULL,
    p_medication_combination VARCHAR DEFAULT NULL,
    p_comorbidities TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_current_day INTEGER;
    v_treatment_date DATE;
BEGIN
    -- Convert string date to DATE for calculation
    BEGIN
        v_treatment_date := p_treatment_start_date::DATE;
        -- Calculate current day based on treatment start date
        v_current_day := GREATEST(0, EXTRACT(DAY FROM (CURRENT_DATE - v_treatment_date)));
    EXCEPTION WHEN OTHERS THEN
        -- If date conversion fails, set current_day to 0
        v_current_day := 0;
    END;
    
    -- Insert user profile
    INSERT INTO user_profiles (
        user_id, treatment_start_date, current_day,
        health_facility, doctor_name, tb_type,
        medication_combination, comorbidities
    ) VALUES (
        p_user_id, p_treatment_start_date, v_current_day,
        p_health_facility, p_doctor_name, p_tb_type,
        p_medication_combination, p_comorbidities
    );
    
    -- Create initial dashboard entry
    INSERT INTO user_dashboard (
        user_id, total_points, current_streak, longest_streak, 
        current_day, streak_days, treatment_phase
    )
    VALUES (
        p_user_id, 0, 0, 0, 
        v_current_day, 0, 'Intensive'
    )
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to verify user password (phone-only)
CREATE OR REPLACE FUNCTION verify_user_password(
    p_phone VARCHAR,
    p_password VARCHAR
) RETURNS TABLE(is_valid BOOLEAN) AS $$
BEGIN
    -- This is a placeholder function
    -- In a real implementation, you would hash and compare passwords
    -- For now, we'll just return true for testing purposes
    RETURN QUERY SELECT true::BOOLEAN;
END;
$$ LANGUAGE plpgsql;

-- Function to schedule sputum reminders
CREATE OR REPLACE FUNCTION schedule_sputum_reminders(
    p_user_id UUID
) RETURNS VOID AS $$
DECLARE
    v_treatment_start_date VARCHAR(10);
    v_treatment_date DATE;
    v_reminder_date DATE;
BEGIN
    -- Get treatment start date
    SELECT treatment_start_date INTO v_treatment_start_date
    FROM user_profiles 
    WHERE user_id = p_user_id;
    
    IF v_treatment_start_date IS NOT NULL THEN
        BEGIN
            -- Convert string to date
            v_treatment_date := v_treatment_start_date::DATE;
            
            -- Schedule sputum collection reminders
            -- Month 0 (baseline)
            v_reminder_date := v_treatment_date;
            INSERT INTO sputum_collection_schedule (user_id, collection_date, collection_type)
            VALUES (p_user_id, v_reminder_date::VARCHAR, 'baseline');
            
            -- Month 2
            v_reminder_date := v_treatment_date + INTERVAL '2 months';
            INSERT INTO sputum_collection_schedule (user_id, collection_date, collection_type)
            VALUES (p_user_id, v_reminder_date::VARCHAR, 'month_2');
            
            -- Month 5
            v_reminder_date := v_treatment_date + INTERVAL '5 months';
            INSERT INTO sputum_collection_schedule (user_id, collection_date, collection_type)
            VALUES (p_user_id, v_reminder_date::VARCHAR, 'month_5');
            
            -- Month 6 (end of treatment)
            v_reminder_date := v_treatment_date + INTERVAL '6 months';
            INSERT INTO sputum_collection_schedule (user_id, collection_date, collection_type)
            VALUES (p_user_id, v_reminder_date::VARCHAR, 'end_treatment');
        EXCEPTION WHEN OTHERS THEN
            -- If date conversion fails, skip scheduling
            NULL;
        END;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update post like count
CREATE OR REPLACE FUNCTION update_post_like_count(
    p_post_id UUID,
    p_increment INTEGER
) RETURNS VOID AS $$
BEGIN
    UPDATE community_posts 
    SET likes_count = likes_count + p_increment,
        updated_at = NOW()
    WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update post comment count
CREATE OR REPLACE FUNCTION update_post_comment_count(
    p_post_id UUID
) RETURNS VOID AS $$
BEGIN
    UPDATE community_posts 
    SET comments_count = (
        SELECT COUNT(*) 
        FROM community_comments 
        WHERE post_id = p_post_id
    ),
    updated_at = NOW()
    WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to award community points (simplified version without p_points and p_description)
CREATE OR REPLACE FUNCTION award_community_points(
    p_user_id UUID,
    p_post_id UUID
) RETURNS VOID AS $$
DECLARE
    v_points INTEGER := 20; -- Fixed community points value
BEGIN
    -- Insert point transaction
    INSERT INTO point_transactions (user_id, points, transaction_type, description)
    VALUES (p_user_id, v_points, 'community_activity', 'Community post activity');
    
    -- Update user dashboard
    UPDATE user_dashboard 
    SET total_points = total_points + v_points,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Also update user_profiles if it exists
    UPDATE user_profiles 
    SET total_points = total_points + v_points,
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_dashboard_updated_at BEFORE UPDATE ON user_dashboard FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_inputs_updated_at BEFORE UPDATE ON daily_inputs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sputum_collection_schedule_updated_at BEFORE UPDATE ON sputum_collection_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON community_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users table indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at);

-- User profiles indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_treatment_start_date ON user_profiles(treatment_start_date);

-- User dashboard indexes
CREATE INDEX idx_user_dashboard_user_id ON user_dashboard(user_id);

-- Daily inputs indexes
CREATE INDEX idx_daily_inputs_user_id ON daily_inputs(user_id);
CREATE INDEX idx_daily_inputs_input_date ON daily_inputs(input_date);
CREATE INDEX idx_daily_inputs_user_id_date ON daily_inputs(user_id, input_date);

-- Point transactions indexes
CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at);

-- Reminders indexes
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_scheduled_at ON reminders(scheduled_at);
CREATE INDEX idx_reminders_is_sent ON reminders(is_sent);

-- Sputum collection indexes
CREATE INDEX idx_sputum_collection_user_id ON sputum_collection_schedule(user_id);
CREATE INDEX idx_sputum_collection_date ON sputum_collection_schedule(collection_date);

-- Community posts indexes
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX idx_community_posts_post_type ON community_posts(post_type);

-- Community comments indexes
CREATE INDEX idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX idx_community_comments_user_id ON community_comments(user_id);
CREATE INDEX idx_community_comments_parent_id ON community_comments(parent_comment_id);

-- Community likes indexes
CREATE INDEX idx_community_likes_user_id ON community_likes(user_id);
CREATE INDEX idx_community_likes_post_id ON community_likes(post_id);
CREATE INDEX idx_community_likes_comment_id ON community_likes(comment_id);

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- No initial data inserted as requested

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sputum_collection_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- User profiles table policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User dashboard table policies
CREATE POLICY "Users can view own dashboard" ON user_dashboard FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own dashboard" ON user_dashboard FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dashboard" ON user_dashboard FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily inputs table policies
CREATE POLICY "Users can view own daily inputs" ON daily_inputs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily inputs" ON daily_inputs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily inputs" ON daily_inputs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily inputs" ON daily_inputs FOR DELETE USING (auth.uid() = user_id);

-- Medication logs table policies
CREATE POLICY "Users can view own medication logs" ON medication_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medication logs" ON medication_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Point transactions table policies
CREATE POLICY "Users can view own point transactions" ON point_transactions FOR SELECT USING (auth.uid() = user_id);

-- Reminders table policies
CREATE POLICY "Users can view own reminders" ON reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders" ON reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON reminders FOR DELETE USING (auth.uid() = user_id);

-- Sputum collection table policies
CREATE POLICY "Users can view own sputum schedule" ON sputum_collection_schedule FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own sputum schedule" ON sputum_collection_schedule FOR UPDATE USING (auth.uid() = user_id);

-- Community posts table policies
CREATE POLICY "Users can view all posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- Community comments table policies
CREATE POLICY "Users can view all comments" ON community_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON community_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON community_comments FOR DELETE USING (auth.uid() = user_id);

-- Community likes table policies
CREATE POLICY "Users can view all likes" ON community_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON community_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON community_likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Phone-only authentication users table (no Supabase auth)';
COMMENT ON TABLE user_profiles IS 'Medical and treatment information for users';
COMMENT ON TABLE user_dashboard IS 'Dashboard statistics and summary data';
COMMENT ON TABLE daily_inputs IS 'Daily patient data and medication tracking';
COMMENT ON TABLE medication_logs IS 'Detailed medication taking logs';
COMMENT ON TABLE point_transactions IS 'Point earning and spending transactions';
COMMENT ON TABLE reminders IS 'User reminders and notifications';
COMMENT ON TABLE sputum_collection_schedule IS 'Sputum collection appointments and schedules';
COMMENT ON TABLE community_posts IS 'Community forum posts';
COMMENT ON TABLE community_comments IS 'Comments on community posts';
COMMENT ON TABLE community_likes IS 'Likes on posts and comments';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
