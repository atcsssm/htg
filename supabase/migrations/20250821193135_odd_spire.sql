/*
  # Fix user activity logs foreign key constraint

  1. Database Changes
    - Update safe_log_user_activity function to properly check user existence
    - Add better error handling for foreign key constraints
    - Ensure user exists before logging activity

  2. Security
    - Maintain RLS policies
    - Proper error handling for missing users
*/

-- Drop and recreate the safe_log_user_activity function with better user existence checking
DROP FUNCTION IF EXISTS safe_log_user_activity(uuid, text, text, text, timestamptz, timestamptz, jsonb);

CREATE OR REPLACE FUNCTION safe_log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_ip_address text DEFAULT 'unknown',
  p_user_agent text DEFAULT 'unknown',
  p_login_time timestamptz DEFAULT NULL,
  p_logout_time timestamptz DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb AS $$
DECLARE
v_user_exists boolean;
BEGIN
  RETURN jsonb_build_object('status', 'ok');
END;
$$ LANGUAGE plpgsql;
BEGIN
  -- Check if user exists in tbl_users table
SELECT EXISTS(
    SELECT 1 FROM tbl_users WHERE tu_id = p_user_id
) INTO v_user_exists;

-- If user doesn't exist, return error without throwing exception
IF NOT v_user_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found in database',
      'user_id', p_user_id
    );
END IF;

  -- Validate activity type
  IF p_activity_type NOT IN ('login', 'logout', 'registration', 'password_reset', 'profile_update') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid activity type'
    );
END IF;

  -- Insert activity log
BEGIN
INSERT INTO tbl_user_activity_logs (
    tual_user_id,
    tual_activity_type,
    tual_ip_address,
    tual_user_agent,
    tual_login_time,
    tual_logout_time,
    tual_metadata
) VALUES (
             p_user_id,
             p_activity_type,
             p_ip_address,
             p_user_agent,
             p_login_time,
             p_logout_time,
             p_metadata
         );

RETURN jsonb_build_object(
        'success', true,
        'message', 'Activity logged successfully'
       );

EXCEPTION
    WHEN foreign_key_violation THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'User reference not found'
      );
WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to log activity: ' || SQLERRM
      );
END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION safe_log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION safe_log_user_activity TO anon;

-- Update the register_user function to ensure user is created before any activity logging
CREATE OR REPLACE FUNCTION register_user(
  p_user_id uuid,
  p_email text,
  p_first_name text,
  p_middle_name text DEFAULT '',
  p_last_name text,
  p_username text,
  p_mobile text DEFAULT '',
  p_user_type text DEFAULT 'learner'
) RETURNS jsonb AS $$
DECLARE
v_sponsorship_number text;
  v_tutor_id uuid;
BEGIN
  -- Validate user type
  IF p_user_type NOT IN ('learner', 'tutor', 'job_seeker', 'job_provider', 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid user type');
END IF;

  -- Insert into tbl_users first
BEGIN
INSERT INTO tbl_users (
    tu_id,
    tu_email,
    tu_user_type,
    tu_is_verified,
    tu_email_verified,
    tu_mobile_verified,
    tu_is_active
) VALUES (
             p_user_id,
             p_email,
             p_user_type,
             false,
             false,
             false,
             true
         ) ON CONFLICT (tu_id) DO UPDATE SET
    tu_email = EXCLUDED.tu_email,
    tu_user_type = EXCLUDED.tu_user_type,
    tu_updated_at = now();

EXCEPTION
    WHEN unique_violation THEN
      -- If email already exists, return error
      IF SQLERRM LIKE '%tu_email_key%' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Email already registered');
END IF;
      -- For other unique violations, continue
END;

  -- Generate sponsorship number for the profile
SELECT LPAD((COALESCE(MAX(CAST(SUBSTRING(tup_sponsorship_number FROM '[0-9]+') AS INTEGER)), 100000) + 1)::text, 6, '0')
INTO v_sponsorship_number
FROM tbl_user_profiles
WHERE tup_sponsorship_number ~ '^[0-9]+$';

-- Insert into tbl_user_profiles
BEGIN
INSERT INTO tbl_user_profiles (
    tup_user_id,
    tup_first_name,
    tup_middle_name,
    tup_last_name,
    tup_username,
    tup_mobile,
    tup_sponsorship_number
) VALUES (
             p_user_id,
             p_first_name,
             p_middle_name,
             p_last_name,
             p_username,
             p_mobile,
             v_sponsorship_number
         ) ON CONFLICT (tup_user_id) DO UPDATE SET
    tup_first_name = EXCLUDED.tup_first_name,
    tup_middle_name = EXCLUDED.tup_middle_name,
    tup_last_name = EXCLUDED.tup_last_name,
    tup_username = EXCLUDED.tup_username,
    tup_mobile = EXCLUDED.tup_mobile,
    tup_updated_at = now();

EXCEPTION
    WHEN unique_violation THEN
      IF SQLERRM LIKE '%tup_username%' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Username already taken');
      ELSIF SQLERRM LIKE '%tup_sponsorship_number%' THEN
        -- Retry with new sponsorship number
        v_sponsorship_number := LPAD((EXTRACT(EPOCH FROM now())::bigint % 999999)::text, 6, '0');
UPDATE tbl_user_profiles SET tup_sponsorship_number = v_sponsorship_number WHERE tup_user_id = p_user_id;
END IF;
END;

  -- Create tutor profile if user type is tutor
  IF p_user_type = 'tutor' THEN
    INSERT INTO tbl_tutors (
      tt_user_id,
      tt_bio,
      tt_specializations,
      tt_experience_years,
      tt_hourly_rate,
      tt_is_verified,
      tt_is_active
    ) VALUES (
      p_user_id,
      'New tutor profile',
      '[]'::jsonb,
      0,
      25.00,
      false,
      true
    ) ON CONFLICT (tt_user_id) DO NOTHING;
END IF;

  -- Now safely log the registration activity (user definitely exists)
  PERFORM safe_log_user_activity(
    p_user_id,
    'registration',
    'unknown',
    'registration-system'
  );

RETURN jsonb_build_object(
        'success', true,
        'message', 'User registered successfully',
        'sponsorship_number', v_sponsorship_number
       );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Registration failed: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION register_user TO authenticated;
GRANT EXECUTE ON FUNCTION register_user TO anon;