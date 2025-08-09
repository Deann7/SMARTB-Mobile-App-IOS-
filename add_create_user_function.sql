-- Add create_user function to handle user creation with RLS bypass
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

-- Add INSERT policy for users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can create own profile'
  ) THEN
    CREATE POLICY "Users can create own profile" ON users
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;
