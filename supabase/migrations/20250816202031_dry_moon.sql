/*
  # Fix Course Table References
  
  This migration fixes the course table structure to ensure proper relationships
  and adds missing columns that the CourseManagement component expects.
  
  1. Changes
    - Add missing tc_category_id column if it doesn't exist
    - Ensure proper foreign key relationships
    - Add any missing columns for course management
*/

-- Add tc_category_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tbl_courses' AND column_name = 'tc_category_id'
  ) THEN
    ALTER TABLE tbl_courses ADD COLUMN tc_category_id uuid REFERENCES tbl_course_categories(tcc_id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update existing courses to have a category if they don't have one
UPDATE tbl_courses 
SET tc_category_id = (
  SELECT tcc_id 
  FROM tbl_course_categories 
  WHERE tcc_name = 'Programming' 
  LIMIT 1
)
WHERE tc_category_id IS NULL;

-- Ensure all required columns exist with proper defaults
DO $$
BEGIN
  -- Add tc_short_description if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tbl_courses' AND column_name = 'tc_short_description'
  ) THEN
    ALTER TABLE tbl_courses ADD COLUMN tc_short_description text;
    UPDATE tbl_courses SET tc_short_description = LEFT(tc_description, 100) WHERE tc_short_description IS NULL;
  END IF;

  -- Add tc_learning_outcomes if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tbl_courses' AND column_name = 'tc_learning_outcomes'
  ) THEN
    ALTER TABLE tbl_courses ADD COLUMN tc_learning_outcomes jsonb DEFAULT '[]';
  END IF;

  -- Add tc_tags if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tbl_courses' AND column_name = 'tc_tags'
  ) THEN
    ALTER TABLE tbl_courses ADD COLUMN tc_tags jsonb DEFAULT '[]';
  END IF;

  -- Add tc_featured if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tbl_courses' AND column_name = 'tc_featured'
  ) THEN
    ALTER TABLE tbl_courses ADD COLUMN tc_featured boolean DEFAULT false;
  END IF;

  -- Add tc_total_lessons if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tbl_courses' AND column_name = 'tc_total_lessons'
  ) THEN
    ALTER TABLE tbl_courses ADD COLUMN tc_total_lessons integer DEFAULT 0;
  END IF;

  -- Add tc_duration_hours if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tbl_courses' AND column_name = 'tc_duration_hours'
  ) THEN
    ALTER TABLE tbl_courses ADD COLUMN tc_duration_hours integer DEFAULT 0;
  END IF;
END $$;

-- Success message
SELECT 'Course table structure updated successfully!' as status;