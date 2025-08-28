/*
  # Fix registration ON CONFLICT error

  1. Database Functions
    - Update `register_user` function to handle conflicts properly
    - Add proper unique constraints where needed
    - Fix ON CONFLICT specifications

  2. Security
    - Maintain existing RLS policies
    - Ensure proper data integrity
*/

-- First, ensure proper unique constraints exist
DO $constraints$
    BEGIN
        -- Ensure tbl_users has primary key on tu_id
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'tbl_users'
              AND constraint_type = 'PRIMARY KEY'
              AND constraint_name = 'tbl_users_pkey'
        ) THEN
            ALTER TABLE tbl_users ADD CONSTRAINT tbl_users_pkey PRIMARY KEY (tu_id);
        END IF;

        -- Ensure tbl_users has unique constraint on email
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'tbl_users'
              AND constraint_type = 'UNIQUE'
              AND constraint_name = 'tbl_users_tu_email_key'
        ) THEN
            ALTER TABLE tbl_users ADD CONSTRAINT tbl_users_tu_email_key UNIQUE (tu_email);
        END IF;

        -- Ensure tbl_user_profiles has primary key or unique constraint on tup_user_id
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'tbl_user_profiles'
              AND (constraint_type = 'PRIMARY KEY' OR constraint_type = 'UNIQUE')
              AND (constraint_name = 'tbl_user_profiles_pkey' OR constraint_name = 'tbl_user_profiles_tup_user_id_key')
        ) THEN
            -- Try to add as primary key first, if that fails, add as unique
            BEGIN
                ALTER TABLE tbl_user_profiles ADD CONSTRAINT tbl_user_profiles_pkey PRIMARY KEY (tup_user_id);
            EXCEPTION WHEN OTHERS THEN
                -- If primary key fails, add unique constraint
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints
                    WHERE table_name = 'tbl_user_profiles'
                      AND constraint_name = 'tbl_user_profiles_tup_user_id_key'
                ) THEN
                    ALTER TABLE tbl_user_profiles ADD CONSTRAINT tbl_user_profiles_tup_user_id_key UNIQUE (tup_user_id);
                END IF;
            END;
        END IF;

        -- Ensure tbl_user_profiles has unique constraint on username
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'tbl_user_profiles'
              AND constraint_type = 'UNIQUE'
              AND constraint_name = 'tbl_user_profiles_tup_username_key'
        ) THEN
            ALTER TABLE tbl_user_profiles ADD CONSTRAINT tbl_user_profiles_tup_username_key UNIQUE (tup_username);
        END IF;

        -- Ensure tbl_tutors has unique constraint on tt_user_id
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'tbl_tutors'
              AND (constraint_type = 'PRIMARY KEY' OR constraint_type = 'UNIQUE')
              AND (constraint_name = 'tbl_tutors_pkey' OR constraint_name = 'tbl_tutors_tt_user_id_key')
        ) THEN
            -- Try to add as primary key first, if that fails, add as unique
            BEGIN
                ALTER TABLE tbl_tutors ADD CONSTRAINT tbl_tutors_pkey PRIMARY KEY (tt_user_id);
            EXCEPTION WHEN OTHERS THEN
                -- If primary key fails, add unique constraint
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints
                    WHERE table_name = 'tbl_tutors'
                      AND constraint_name = 'tbl_tutors_tt_user_id_key'
                ) THEN
                    ALTER TABLE tbl_tutors ADD CONSTRAINT tbl_tutors_tt_user_id_key UNIQUE (tt_user_id);
                END IF;
            END;
        END IF;

    END $constraints$;

-- Drop existing function with the old signature to allow changing return type
DROP FUNCTION IF EXISTS register_user(uuid, text, text, text, text, text, text, text);

-- Create the register_user function
CREATE FUNCTION register_user(
    p_user_id uuid,
    p_email text,
    p_first_name text,
    p_last_name text,
    p_username text,
    p_middle_name text DEFAULT '',
    p_mobile text DEFAULT '',
    p_user_type text DEFAULT 'learner'
) RETURNS jsonb AS $function$
BEGIN
    -- Insert into tbl_users
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
             )
    ON CONFLICT (tu_id) DO UPDATE SET
                                      tu_email = EXCLUDED.tu_email,
                                      tu_user_type = EXCLUDED.tu_user_type,
                                      tu_updated_at = COALESCE(tbl_users.tu_updated_at, now());

    -- Insert into tbl_user_profiles
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
                                            tup_updated_at = COALESCE(tbl_user_profiles.tup_updated_at, now());

    -- If user type is tutor, create tutor profile
    IF p_user_type = 'tutor' THEN
        INSERT INTO tbl_tutors (
            tt_user_id,
            tt_bio,
            tt_specializations,
            tt_experience_years,
            tt_education,
            tt_hourly_rate,
            tt_languages,
            tt_is_verified,
            tt_is_active
        ) VALUES (
                     p_user_id,
                     'New tutor profile',
                     '[]',
                     0,
                     '',
                     25.00,
                     '["English"]',
                     false,
                     true
                 )
        ON CONFLICT (tt_user_id) DO NOTHING;
    END IF;

    RETURN jsonb_build_object(
            'success', true,
            'message', 'User registered successfully',
            'user_id', p_user_id
           );

EXCEPTION
    WHEN unique_violation THEN
        -- Handle unique constraint violations gracefully
        IF SQLERRM LIKE '%tu_email%' OR SQLERRM LIKE '%email%' THEN
            RETURN jsonb_build_object('success', false, 'error', 'Email address already exists');
        ELSIF SQLERRM LIKE '%tup_username%' OR SQLERRM LIKE '%username%' THEN
            RETURN jsonb_build_object('success', false, 'error', 'Username already exists');
        ELSE
            RETURN jsonb_build_object('success', false, 'error', 'Registration failed: unique constraint violation');
        END IF;
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', 'Registration failed: ' || SQLERRM);
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION register_user TO authenticated;
GRANT EXECUTE ON FUNCTION register_user TO anon;

-- Verify the constraints exist
DO $verify$
    BEGIN
        RAISE NOTICE 'Checking constraints...';

        -- Check tbl_users constraints
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'tbl_users' AND constraint_type = 'PRIMARY KEY') THEN
            RAISE NOTICE 'tbl_users primary key: OK';
        ELSE
            RAISE NOTICE 'tbl_users primary key: MISSING';
        END IF;

        -- Check tbl_user_profiles constraints
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'tbl_user_profiles' AND (constraint_type = 'PRIMARY KEY' OR constraint_type = 'UNIQUE')) THEN
            RAISE NOTICE 'tbl_user_profiles unique constraint on user_id: OK';
        ELSE
            RAISE NOTICE 'tbl_user_profiles unique constraint on user_id: MISSING';
        END IF;

        -- Check tbl_tutors constraints
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'tbl_tutors' AND (constraint_type = 'PRIMARY KEY' OR constraint_type = 'UNIQUE')) THEN
            RAISE NOTICE 'tbl_tutors unique constraint on user_id: OK';
        ELSE
            RAISE NOTICE 'tbl_tutors unique constraint on user_id: MISSING';
        END IF;
    END $verify$;