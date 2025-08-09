-- SMARTB Database Schema - Complete and Corrected
-- This file contains the complete database schema with all necessary fixes
-- Run this file to create a fresh database or reset your existing one

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USER MANAGEMENT TABLES
-- ============================================================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10),
  national_id VARCHAR(16) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  notification_settings JSONB DEFAULT '{"medication": true, "sputum": true, "community": true}'::jsonb
);

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  treatment_start_date DATE NOT NULL,
  treatment_phase VARCHAR(50) DEFAULT 'Intensive',
  current_day INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_data_input_date DATE,
  health_facility VARCHAR(255),
  doctor_name VARCHAR(255),
  tb_type VARCHAR(50),
  medication_combination VARCHAR(100),
  comorbidities TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. DAILY DATA INPUT TABLES
-- ============================================================================

-- Daily inputs table
CREATE TABLE daily_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  input_date DATE NOT NULL,
  medication_taken BOOLEAN DEFAULT FALSE,
  medication_time TIME,
  symptoms JSONB,
  cough_description JSONB,
  activities JSONB,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  mental_health_symptoms JSONB,
  other_activities TEXT,
  points_earned INTEGER DEFAULT 0,
  is_complete BOOLEAN DEFAULT FALSE,
  is_on_time BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, input_date)
);

-- Medication logs table
CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  daily_input_id UUID REFERENCES daily_inputs(id) ON DELETE CASCADE,
  medication_name VARCHAR(255),
  dosage VARCHAR(100),
  taken_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. REWARD SYSTEM TABLES
-- ============================================================================

-- Point transactions table
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  daily_input_id UUID REFERENCES daily_inputs(id),
  points INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'complete_input_on_time', 'complete_input_late', 'medication_only', 'missed_medication', 'community_share'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  icon_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================================================
-- 4. REMINDER SYSTEM TABLES
-- ============================================================================

-- Reminders table
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL, -- 'medication', 'sputum_collection', 'appointment'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB, -- {"type": "daily", "interval": 1}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sputum collection schedule table
CREATE TABLE sputum_collection_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  collection_date DATE NOT NULL,
  collection_type VARCHAR(50) NOT NULL, -- '2_month', '6_month'
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. COMMUNITY FEATURES TABLES
-- ============================================================================

-- Community posts table
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  post_type VARCHAR(50) DEFAULT 'story', -- 'story', 'question', 'achievement'
  is_anonymous BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community comments table
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES community_comments(id),
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community likes table
CREATE TABLE community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

-- ============================================================================
-- 6. PERFORMANCE INDEXES
-- ============================================================================

-- Index for daily inputs by user and date
CREATE INDEX idx_daily_inputs_user_date ON daily_inputs(user_id, input_date);

-- Index for point transactions
CREATE INDEX idx_point_transactions_user_date ON point_transactions(user_id, created_at);

-- Index for reminders
CREATE INDEX idx_reminders_user_scheduled ON reminders(user_id, scheduled_at);

-- Index for community posts
CREATE INDEX idx_community_posts_approved_created ON community_posts(is_approved, created_at);

-- Index for user profiles
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Index for medication logs
CREATE INDEX idx_medication_logs_user_date ON medication_logs(user_id, created_at);

-- ============================================================================
-- 7. DATABASE FUNCTIONS
-- ============================================================================

-- Function to create user (handles RLS issues)
-- This function is needed to bypass RLS policies when creating users
CREATE OR REPLACE FUNCTION create_user(
  p_id UUID,
  p_email VARCHAR(255),
  p_phone VARCHAR(20) DEFAULT NULL,
  p_full_name VARCHAR(255) DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_gender VARCHAR(10) DEFAULT NULL,
  p_national_id VARCHAR(16) DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_user_exists BOOLEAN := FALSE;
BEGIN
  -- Check if user already exists
  SELECT EXISTS(
    SELECT 1 FROM users WHERE id = p_id
  ) INTO v_user_exists;
  
  -- If user doesn't exist, create it
  IF NOT v_user_exists THEN
    INSERT INTO users (
      id,
      email,
      phone,
      full_name,
      date_of_birth,
      gender,
      national_id
    ) VALUES (
      p_id,
      p_email,
      p_phone,
      p_full_name,
      p_date_of_birth,
      p_gender,
      p_national_id
    );
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE; -- User already existed
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return false
    RAISE NOTICE 'Error creating user %: %', p_id, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user profile (handles RLS issues)
-- This function is needed to bypass RLS policies when creating user profiles
CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id UUID,
  p_treatment_start_date DATE DEFAULT CURRENT_DATE,
  p_health_facility VARCHAR(255) DEFAULT NULL,
  p_doctor_name VARCHAR(255) DEFAULT NULL,
  p_tb_type VARCHAR(50) DEFAULT NULL,
  p_medication_combination VARCHAR(100) DEFAULT NULL,
  p_comorbidities TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_profile_exists BOOLEAN := FALSE;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS(
    SELECT 1 FROM user_profiles WHERE user_id = p_user_id
  ) INTO v_profile_exists;
  
  -- If profile doesn't exist, create it
  IF NOT v_profile_exists THEN
    INSERT INTO user_profiles (
      user_id,
      treatment_start_date,
      current_day,
      total_points,
      streak_days,
      treatment_phase,
      health_facility,
      doctor_name,
      tb_type,
      medication_combination,
      comorbidities
    ) VALUES (
      p_user_id,
      p_treatment_start_date,
      0,
      0,
      0,
      'Intensive',
      p_health_facility,
      p_doctor_name,
      p_tb_type,
      p_medication_combination,
      p_comorbidities
    );
    
    -- Schedule sputum collection reminders
    PERFORM schedule_sputum_reminders(p_user_id);
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE; -- Profile already existed
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return false
    RAISE NOTICE 'Error creating user profile for user %: %', p_user_id, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Point calculation function
CREATE OR REPLACE FUNCTION calculate_daily_points(
  p_user_id UUID,
  p_input_date DATE
) RETURNS INTEGER AS $$
DECLARE
  v_points INTEGER := 0;
  v_input_data RECORD;
  v_is_on_time BOOLEAN;
BEGIN
  -- Get input data for the day
  SELECT * INTO v_input_data 
  FROM daily_inputs 
  WHERE user_id = p_user_id AND input_date = p_input_date;
  
  -- Check if input is on time (before 11:59 PM of the same day)
  v_is_on_time := v_input_data.created_at::date = p_input_date;
  
  -- Calculate points based on completeness
  IF v_input_data.is_complete THEN
    IF v_is_on_time THEN
      v_points := 100; -- Complete input on time
    ELSE
      v_points := 80;  -- Complete input late
    END IF;
  ELSIF v_input_data.medication_taken THEN
    v_points := 50;    -- Only medication data
  ELSE
    v_points := -50;   -- No medication data
  END IF;
  
  -- Update points in daily_inputs
  UPDATE daily_inputs 
  SET points_earned = v_points, is_on_time = v_is_on_time
  WHERE user_id = p_user_id AND input_date = p_input_date;
  
  -- Add point transaction
  INSERT INTO point_transactions (user_id, daily_input_id, points, transaction_type, description)
  VALUES (p_user_id, v_input_data.id, v_points, 
          CASE 
            WHEN v_input_data.is_complete AND v_is_on_time THEN 'complete_input_on_time'
            WHEN v_input_data.is_complete AND NOT v_is_on_time THEN 'complete_input_late'
            WHEN v_input_data.medication_taken THEN 'medication_only'
            ELSE 'missed_medication'
          END,
          'Daily input points calculation');
  
  -- Update user total points
  UPDATE user_profiles 
  SET total_points = total_points + v_points
  WHERE user_id = p_user_id;
  
  RETURN v_points;
END;
$$ LANGUAGE plpgsql;

-- Sputum collection reminder function
CREATE OR REPLACE FUNCTION schedule_sputum_reminders(
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_treatment_start_date DATE;
  v_two_month_date DATE;
  v_six_month_date DATE;
BEGIN
  -- Get treatment start date
  SELECT treatment_start_date INTO v_treatment_start_date
  FROM user_profiles 
  WHERE user_id = p_user_id;
  
  -- Calculate reminder dates
  v_two_month_date := v_treatment_start_date + INTERVAL '2 months';
  v_six_month_date := v_treatment_start_date + INTERVAL '6 months';
  
  -- Schedule 2-month reminder
  INSERT INTO reminders (user_id, reminder_type, title, message, scheduled_at)
  VALUES (p_user_id, 'sputum_collection', 
          'Jadwal Pemeriksaan Sputum', 
          'Sudah 2 bulan pengobatan Anda. Silakan lakukan pemeriksaan sputum sesuai jadwal dokter.',
          v_two_month_date);
  
  -- Schedule 6-month reminder
  INSERT INTO reminders (user_id, reminder_type, title, message, scheduled_at)
  VALUES (p_user_id, 'sputum_collection', 
          'Jadwal Pemeriksaan Sputum', 
          'Sudah 6 bulan pengobatan Anda. Silakan lakukan pemeriksaan sputum sesuai jadwal dokter.',
          v_six_month_date);
  
  -- Add to sputum collection schedule
  INSERT INTO sputum_collection_schedule (user_id, collection_date, collection_type)
  VALUES 
    (p_user_id, v_two_month_date, '2_month'),
    (p_user_id, v_six_month_date, '6_month');
END;
$$ LANGUAGE plpgsql;

-- Community share points function
CREATE OR REPLACE FUNCTION award_community_points(
  p_user_id UUID,
  p_post_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Award points for community sharing
  INSERT INTO point_transactions (user_id, points, transaction_type, description)
  VALUES (p_user_id, 20, 'community_share', 'Points for sharing in community');
  
  -- Update user total points
  UPDATE user_profiles 
  SET total_points = total_points + 20
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Update streak days function
CREATE OR REPLACE FUNCTION update_streak_days(
  p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_streak_days INTEGER := 0;
  v_current_date DATE := CURRENT_DATE;
  v_check_date DATE := v_current_date;
BEGIN
  -- Calculate streak days
  WHILE EXISTS (
    SELECT 1 FROM daily_inputs 
    WHERE user_id = p_user_id AND input_date = v_check_date
  ) LOOP
    v_streak_days := v_streak_days + 1;
    v_check_date := v_check_date - INTERVAL '1 day';
  END LOOP;
  
  -- Update user profile
  UPDATE user_profiles 
  SET streak_days = v_streak_days
  WHERE user_id = p_user_id;
  
  RETURN v_streak_days;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sputum_collection_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Allow create_user_profile function to insert user profiles
CREATE POLICY "Allow function to create user profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- Daily inputs policies
CREATE POLICY "Users can manage own daily inputs" ON daily_inputs
  FOR ALL USING (auth.uid() = user_id);

-- Medication logs policies
CREATE POLICY "Users can manage own medication logs" ON medication_logs
  FOR ALL USING (auth.uid() = user_id);

-- Point transactions policies
CREATE POLICY "Users can view own point transactions" ON point_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Reminders policies
CREATE POLICY "Users can manage own reminders" ON reminders
  FOR ALL USING (auth.uid() = user_id);

-- Sputum collection policies
CREATE POLICY "Users can manage own sputum schedule" ON sputum_collection_schedule
  FOR ALL USING (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "Users can view approved posts" ON community_posts
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create own posts" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON community_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Community comments policies
CREATE POLICY "Users can view comments on approved posts" ON community_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_posts 
      WHERE id = community_comments.post_id AND is_approved = true
    )
  );

CREATE POLICY "Users can create comments" ON community_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON community_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Community likes policies
CREATE POLICY "Users can view likes on approved posts" ON community_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_posts 
      WHERE id = community_likes.post_id AND is_approved = true
    )
  );

CREATE POLICY "Users can manage own likes" ON community_likes
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 9. SAMPLE DATA
-- ============================================================================

-- Insert sample achievements
INSERT INTO achievements (name, description, points_required, icon_name) VALUES
('Pemula TB', 'Mulai perjalanan pengobatan TB', 0, 'star'),
('Konsisten 7 Hari', 'Input data selama 7 hari berturut-turut', 700, 'calendar'),
('Konsisten 30 Hari', 'Input data selama 30 hari berturut-turut', 3000, 'trophy'),
('Pengobatan Fase Intensif', 'Menyelesaikan fase intensif pengobatan', 5000, 'medal'),
('Pengobatan Fase Lanjutan', 'Menyelesaikan fase lanjutan pengobatan', 10000, 'crown'),
('Berbagi Cerita', 'Berbagi pengalaman di komunitas', 20, 'heart'),
('Pemeriksaan Sputum', 'Menyelesaikan pemeriksaan sputum', 500, 'checkmark'),
('Semangat Pagi', 'Input data tepat waktu 5 hari berturut-turut', 500, 'sunny'),
('Pemenang Mingguan', 'Mendapatkan poin tertinggi dalam seminggu', 1000, 'trophy'),
('Komunitas Aktif', 'Berpartisipasi dalam 10 diskusi komunitas', 200, 'people');

-- ============================================================================
-- 10. TRIGGERS
-- ============================================================================

-- Trigger to update streak days when daily input is inserted/updated
CREATE OR REPLACE FUNCTION trigger_update_streak()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_streak_days(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_streak_trigger
  AFTER INSERT OR UPDATE ON daily_inputs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_streak();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_inputs_updated_at BEFORE UPDATE ON daily_inputs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sputum_collection_schedule_updated_at BEFORE UPDATE ON sputum_collection_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON community_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 11. VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for user dashboard data
CREATE VIEW user_dashboard AS
SELECT 
  u.id as user_id,
  u.full_name,
  up.treatment_phase,
  up.current_day,
  up.total_points,
  up.streak_days,
  up.last_data_input_date,
  COUNT(di.id) as total_inputs,
  COUNT(CASE WHEN di.is_complete THEN 1 END) as complete_inputs,
  COUNT(CASE WHEN di.medication_taken THEN 1 END) as medication_days
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN daily_inputs di ON u.id = di.user_id
GROUP BY u.id, u.full_name, up.treatment_phase, up.current_day, up.total_points, up.streak_days, up.last_data_input_date;

-- View for user achievements
CREATE VIEW user_achievements_view AS
SELECT 
  ua.user_id,
  a.name as achievement_name,
  a.description,
  a.points_required,
  a.icon_name,
  ua.earned_at,
  CASE WHEN ua.user_id IS NOT NULL THEN true ELSE false END as is_earned
FROM achievements a
LEFT JOIN user_achievements ua ON a.id = ua.achievement_id;

-- View for community posts with user info
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
    WHEN cp.is_anonymous THEN 'Anonymous'
    ELSE u.full_name 
  END as author_name,
  u.avatar_url as author_avatar
FROM community_posts cp
LEFT JOIN users u ON cp.user_id = u.id
WHERE cp.is_approved = true;

-- ============================================================================
-- 12. COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Main users table for SMARTB app';
COMMENT ON TABLE user_profiles IS 'User treatment profiles and progress tracking';
COMMENT ON TABLE daily_inputs IS 'Daily health data input from users';
COMMENT ON TABLE medication_logs IS 'Detailed medication tracking';
COMMENT ON TABLE point_transactions IS 'Point system transactions';
COMMENT ON TABLE achievements IS 'Available achievements for users';
COMMENT ON TABLE user_achievements IS 'Achievements earned by users';
COMMENT ON TABLE reminders IS 'Scheduled reminders for users';
COMMENT ON TABLE sputum_collection_schedule IS 'Sputum collection appointments';
COMMENT ON TABLE community_posts IS 'Community posts and stories';
COMMENT ON TABLE community_comments IS 'Comments on community posts';
COMMENT ON TABLE community_likes IS 'Likes on posts and comments';

COMMENT ON FUNCTION calculate_daily_points IS 'Calculate points for daily input based on completeness and timing';
COMMENT ON FUNCTION schedule_sputum_reminders IS 'Schedule sputum collection reminders for 2 and 6 months';
COMMENT ON FUNCTION award_community_points IS 'Award points for community sharing';
COMMENT ON FUNCTION update_streak_days IS 'Update user streak days based on daily inputs';
COMMENT ON FUNCTION create_user IS 'Create user in custom users table (bypasses RLS)';
COMMENT ON FUNCTION create_user_profile IS 'Create user profile (bypasses RLS)';
