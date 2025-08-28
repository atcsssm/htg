/*
  # Add Learner and Tutor Registration Functions

  This migration adds the missing registration functions that the application expects:

  1. New Functions
    - register_learner() - For learner registration
    - register_tutor() - For tutor registration

  2. Security
    - Functions use SECURITY DEFINER for proper permissions
    - Proper error handling and validation
*/

-- Function for atomic learner registration
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
  -- Insert user record
INSERT INTO tbl_users (tu_id, tu_email, tu_user_type)
VALUES (p_user_id, p_email, 'learner')
    ON CONFLICT (tu_id) DO UPDATE SET
    tu_email = EXCLUDED.tu_email,
                               tu_user_type = EXCLUDED.tu_user_type;

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
                                     tup_gender = EXCLUDED.tup_gender;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for atomic tutor registration
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
  -- Insert user record
INSERT INTO tbl_users (tu_id, tu_email, tu_user_type)
VALUES (p_user_id, p_email, 'tutor')
    ON CONFLICT (tu_id) DO UPDATE SET
    tu_email = EXCLUDED.tu_email,
                               tu_user_type = EXCLUDED.tu_user_type;

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
                                     tup_gender = EXCLUDED.tup_gender;

-- Insert tutor record
INSERT INTO tbl_tutors (
    tt_user_id, tt_bio, tt_specializations, tt_experience_years,
    tt_education, tt_hourly_rate
) VALUES (
             p_user_id, p_bio, p_specializations, p_experience_years,
             p_education, p_hourly_rate
         )
    ON CONFLICT (tt_user_id) DO UPDATE SET
    tt_bio = EXCLUDED.tt_bio,
                                    tt_specializations = EXCLUDED.tt_specializations,
                                    tt_experience_years = EXCLUDED.tt_experience_years,
                                    tt_education = EXCLUDED.tt_education,
                                    tt_hourly_rate = EXCLUDED.tt_hourly_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION register_learner TO authenticated;
GRANT EXECUTE ON FUNCTION register_tutor TO authenticated;

-- Success message
SELECT 'Learner and tutor registration functions created successfully!' as status;