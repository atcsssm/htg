/*
  # Fix User Type Check Constraint

  This migration fixes the check constraint issue by updating the constraint
  to allow 'learner' and 'tutor' user types, or alternatively updating the
  registration functions to use the existing allowed types.

  1. Changes
    - Update check constraint to allow 'learner' and 'tutor' types
    - Update registration functions to use correct types
*/

-- Option 1: Update the check constraint to allow learner and tutor types
ALTER TABLE tbl_users DROP CONSTRAINT IF EXISTS tbl_users_tu_user_type_check;
ALTER TABLE tbl_users ADD CONSTRAINT tbl_users_tu_user_type_check
    CHECK (tu_user_type IN ('customer', 'company', 'admin', 'learner', 'tutor'));

-- Option 2: Update registration functions to use existing constraint types
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
  -- Insert user record with 'customer' type (learners are customers in the constraint)
INSERT INTO tbl_users (tu_id, tu_email, tu_user_type, tu_is_active)
VALUES (p_user_id, p_email, 'customer', true)
    ON CONFLICT (tu_id) DO UPDATE SET
    tu_email = EXCLUDED.tu_email,
                               tu_user_type = EXCLUDED.tu_user_type,
                               tu_is_active = EXCLUDED.tu_is_active,
                               tu_updated_at = now();
END;
$$ LANGUAGE plpgsql;
END;
$$ LANGUAGE plpgsql;

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
$$ LANGUAGE plpgsql CREATE OR REPLACE FUNCTION public.fn_security_definer_example()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 1;
$$;

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
  -- Insert user record with 'company' type (tutors are companies in the constraint)
INSERT INTO tbl_users (tu_id, tu_email, tu_user_type, tu_is_active)
VALUES (p_user_id, p_email, 'company', true)
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
SELECT 'User type constraint fixed and registration functions updated!' as status;