/*
  # Simplify User Types for Education Platform

  This migration updates the user type constraint to only include the types
  needed for the education platform: learner, tutor, and admin.

  1. Changes
    - Update check constraint to only allow 'learner', 'tutor', 'admin'
    - Update registration functions to use these correct types
    - Remove references to 'customer' and 'company' types
*/

-- Update the check constraint to only allow education platform user types
ALTER TABLE tbl_users DROP CONSTRAINT IF EXISTS tbl_users_tu_user_type_check;
ALTER TABLE tbl_users ADD CONSTRAINT tbl_users_tu_user_type_check
    CHECK (tu_user_type IN ('learner', 'tutor', 'admin'));

-- Update the register_learner function to use 'learner' type
CREATE OR REPLACE FUNCTION register_learner(
    p_user_id uuid,
    p_email text,
    p_first_name text,
    p_last_name text,
    p_username text,
    p_mobile text,
    p_gender text
) RETURNS void AS $$
BEGIN
    -- Insert user record with 'learner' type
    INSERT INTO tbl_users (tu_id, tu_email, tu_user_type, tu_is_active)
    VALUES (p_user_id, p_email, 'learner', true)
    ON CONFLICT (tu_id) DO UPDATE SET
                                      tu_email = EXCLUDED.tu_email,
                                      tu_user_type = EXCLUDED.tu_user_type,
                                      tu_is_active = EXCLUDED.tu_is_active,
                                      tu_updated_at = now();

    -- Insert profile record
    INSERT INTO tbl_user_profiles (
        tup_user_id, tup_first_name, tup_last_name, tup_username,
        tup_mobile, tup_gender
    ) VALUES (
                 p_user_id, p_first_name, p_last_name, p_username,
                 p_mobile, p_gender
             )
    ON CONFLICT (tup_user_id) DO UPDATE SET
                                            tup_first_name = EXCLUDED.tup_first_name,
                                            tup_last_name = EXCLUDED.tup_last_name,
                                            tup_username = EXCLUDED.tup_username,
                                            tup_mobile = EXCLUDED.tup_mobile,
                                            tup_gender = EXCLUDED.tup_gender,
                                            tup_updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the register_tutor function to use 'tutor' type
CREATE OR REPLACE FUNCTION register_tutor(
    p_user_id uuid,
    p_email text,
    p_first_name text,
    p_last_name text,
    p_username text,
    p_mobile text,
    p_gender text,
    p_bio text,
    p_specializations jsonb,
    p_experience_years integer,
    p_education text,
    p_hourly_rate decimal
) RETURNS void AS $$
BEGIN
    -- Insert user record with 'tutor' type
    INSERT INTO tbl_users (tu_id, tu_email, tu_user_type, tu_is_active)
    VALUES (p_user_id, p_email, 'tutor', true)
    ON CONFLICT (tu_id) DO UPDATE SET
                                      tu_email = EXCLUDED.tu_email,
                                      tu_user_type = EXCLUDED.tu_user_type,
                                      tu_is_active = EXCLUDED.tu_is_active,
                                      tu_updated_at = now();

    -- Insert profile record
    INSERT INTO tbl_user_profiles (
        tup_user_id, tup_first_name, tup_last_name, tup_username,
        tup_mobile, tup_gender
    ) VALUES (
                 p_user_id, p_first_name, p_last_name, p_username,
                 p_mobile, p_gender
             )
    ON CONFLICT (tup_user_id) DO UPDATE SET
                                            tup_first_name = EXCLUDED.tup_first_name,
                                            tup_last_name = EXCLUDED.tup_last_name,
                                            tup_username = EXCLUDED.tup_username,
                                            tup_mobile = EXCLUDED.tup_mobile,
                                            tup_gender = EXCLUDED.tup_gender,
                                            tup_updated_at = now();

    -- Insert tutor record (only for tutors)
    INSERT INTO tbl_tutors (
        tt_user_id, tt_bio, tt_specializations, tt_experience_years,
        tt_education, tt_hourly_rate, tt_is_active
    ) VALUES (
                 p_user_id, p_bio, p_specializations, p_experience_years,
                 p_education, p_hourly_rate, true
             )
    ON CONFLICT (tt_user_id) DO UPDATE SET
                                           tt_bio = EXCLUDED.tt_bio,
                                           tt_specializations = EXCLUDED.tt_specializations,
                                           tt_experience_years = EXCLUDED.tt_experience_years,
                                           tt_education = EXCLUDED.tt_education,
                                           tt_hourly_rate = EXCLUDED.tt_hourly_rate,
                                           tt_is_active = EXCLUDED.tt_is_active,
                                           tt_updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION register_learner TO authenticated;
GRANT EXECUTE ON FUNCTION register_tutor TO authenticated;

-- Success message
SELECT 'User types simplified to learner, tutor, and admin only!' as status;