/*
  # Update User Types for Job Platform

  This migration updates the user type constraint to support the new job platform
  with Learner, Tutor, Job Seeker, and Job Provider types.

  1. Changes
    - Update check constraint to allow 'learner', 'tutor', 'job_seeker', 'job_provider'
    - Add system settings for job seeker and job provider video URLs
    - Update registration functions to handle all user types
*/

-- Update the check constraint to allow job platform user types
ALTER TABLE tbl_users DROP CONSTRAINT IF EXISTS tbl_users_tu_user_type_check;
ALTER TABLE tbl_users ADD CONSTRAINT tbl_users_tu_user_type_check
    CHECK (tu_user_type IN ('learner', 'tutor', 'job_seeker', 'job_provider', 'admin'));

-- Add middle name field to user profiles
ALTER TABLE tbl_user_profiles
    ADD COLUMN IF NOT EXISTS tup_middle_name text;

-- Update registration functions to handle all user types
CREATE OR REPLACE FUNCTION register_user(
    p_user_id uuid,
    p_email text,
    p_first_name text,
    p_middle_name text,
    p_last_name text,
    p_username text,
    p_mobile text,
    p_user_type text
) RETURNS void AS $$
BEGIN
    -- Insert user record
    INSERT INTO tbl_users (tu_id, tu_email, tu_user_type, tu_is_active)
    VALUES (p_user_id, p_email, p_user_type, true)
    ON CONFLICT (tu_id) DO UPDATE SET
                                      tu_email = EXCLUDED.tu_email,
                                      tu_user_type = EXCLUDED.tu_user_type,
                                      tu_is_active = EXCLUDED.tu_is_active,
                                      tu_updated_at = now();

    -- Insert profile record
    INSERT INTO tbl_user_profiles (
        tup_user_id, tup_first_name, tup_middle_name, tup_last_name,
        tup_username, tup_mobile
    ) VALUES (
                 p_user_id, p_first_name, p_middle_name, p_last_name,
                 p_username, p_mobile
             )
    ON CONFLICT (tup_user_id) DO UPDATE SET
                                            tup_first_name = EXCLUDED.tup_first_name,
                                            tup_middle_name = EXCLUDED.tup_middle_name,
                                            tup_last_name = EXCLUDED.tup_last_name,
                                            tup_username = EXCLUDED.tup_username,
                                            tup_mobile = EXCLUDED.tup_mobile,
                                            tup_updated_at = now();

    -- Insert tutor record if user type is tutor
    IF p_user_type = 'tutor' THEN
        INSERT INTO tbl_tutors (tt_user_id, tt_is_active)
        VALUES (p_user_id, true)
        ON CONFLICT (tt_user_id) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION register_user TO authenticated;

-- Add system settings for video URLs
INSERT INTO tbl_system_settings (tss_setting_key, tss_setting_value, tss_description) VALUES
                                                                                          ('job_seeker_video_url', '"https://www.youtube.com/embed/dQw4w9WgXcQ"', 'YouTube video URL for job seekers page'),
                                                                                          ('job_provider_video_url', '"https://www.youtube.com/embed/dQw4w9WgXcQ"', 'YouTube video URL for job providers page')
ON CONFLICT (tss_setting_key) DO NOTHING;

-- Success message
SELECT 'User types updated for job platform with video settings!' as status;