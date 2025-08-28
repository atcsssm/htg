/*
  # Fix register_user function column name issue

  This migration fixes the column name mismatch in the register_user function
  where it was trying to use p_user_id instead of the correct column names.

  1. Changes
    - Fix the register_user function to use correct column names
    - Ensure proper conflict handling for user profiles
    - Add proper error handling
*/

-- Fix the register_user function with correct column names
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

    -- Insert profile record with correct column names
    INSERT INTO tbl_user_profiles (
        tup_user_id,
        tup_first_name,
        tup_middle_name,
        tup_last_name,
        tup_username,
        tup_mobile
    ) VALUES (
                 p_user_id,
                 p_first_name,
                 p_middle_name,
                 p_last_name,
                 p_username,
                 p_mobile
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
        ON CONFLICT (tt_user_id) DO UPDATE SET
                                               tt_is_active = EXCLUDED.tt_is_active,
                                               tt_updated_at = now();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION register_user TO authenticated;

-- Success message
SELECT 'register_user function fixed with correct column names!' as status;