/*
  # Fix User Activity Logs Foreign Key Constraint

  1. Problem Resolution
    - Fix foreign key constraint violations in tbl_user_activity_logs
    - Ensure proper relationship with tbl_users table
    - Add proper error handling for activity logging

  2. Changes Made
    - Update foreign key constraint to handle missing users gracefully
    - Add indexes for better performance
    - Ensure RLS policies are properly configured

  3. Security
    - Maintain RLS on activity logs table
    - Users can only access their own activity logs
*/

-- First, check if there are any orphaned records in activity logs
DELETE FROM tbl_user_activity_logs
WHERE tual_user_id NOT IN (SELECT tu_id FROM tbl_users);

-- Drop and recreate the foreign key constraint with proper handling
ALTER TABLE tbl_user_activity_logs
  SET (autovacuum_enabled = true)
DROP CONSTRAINT IF EXISTS tbl_user_activity_logs_tual_user_id_fkey;

-- Add the foreign key constraint back with CASCADE delete
ALTER TABLE tbl_user_activity_logs
    ADD CONSTRAINT tbl_user_activity_logs_tual_user_id_fkey
        FOREIGN KEY (tual_user_id) REFERENCES tbl_users(tu_id) ON DELETE CASCADE;;

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_tbl_user_activity_logs_user_id
    ON tbl_user_activity_logs(tual_user_id);

CREATE INDEX IF NOT EXISTS idx_tbl_user_activity_logs_activity_type
    ON tbl_user_activity_logs(tual_activity_type);

-- Ensure RLS is enabled and policies are correct
ALTER TABLE tbl_user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own activity logs" ON tbl_user_activity_logs;
DROP POLICY IF EXISTS "Users can insert own activity logs" ON tbl_user_activity_logs;

-- Create proper RLS policies
CREATE POLICY "Users can read own activity logs" ON tbl_user_activity_logs
  FOR SELECT TO authenticated
                           USING (auth.uid() = tual_user_id);

CREATE POLICY "Users can insert own activity logs" ON tbl_user_activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tual_user_id);

-- Create a safer function to log user activity that handles missing users
CREATE OR REPLACE FUNCTION safe_log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_ip_address text DEFAULT 'unknown',
  p_user_agent text DEFAULT 'unknown',
  p_login_time timestamptz DEFAULT now(),
  p_logout_time timestamptz DEFAULT NULL
) RETURNS boolean AS $$
BEGIN
  -- Check if user exists before logging
  IF NOT EXISTS (SELECT 1 FROM tbl_users WHERE tu_id = p_user_id) THEN
    -- User doesn't exist, skip logging
    RETURN false;
END IF;

  -- Insert activity log
INSERT INTO tbl_user_activity_logs (
    tual_user_id,
    tual_activity_type,
    tual_ip_address,
    tual_user_agent,
    tual_login_time,
    tual_logout_time
) VALUES (
             p_user_id,
             p_activity_type,
             p_ip_address,
             p_user_agent,
             p_login_time,
             p_logout_time
         );

RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the main operation
    RAISE WARNING 'Failed to log user activity: %', SQLERRM;
RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION safe_log_user_activity TO authenticated;