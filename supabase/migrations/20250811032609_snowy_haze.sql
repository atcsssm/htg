/*
  # Education Platform Database Schema
  
  This migration creates the complete database structure for a tutor-learner platform:
  
  1. New Tables
    - courses - Course catalog with categories and pricing
    - course_categories - Subject categories (Programming, Science, Math, etc.)
    - course_enrollments - Student enrollments with payment tracking
    - tutors - Tutor profiles and specializations
    - tutor_assignments - Tutor-learner assignments
    - course_content - Videos, materials, and resources
    - learning_progress - Student progress tracking
    - sessions - Live/recorded session management
    - reviews_ratings - Course and tutor reviews
    
  2. Security
    - Row Level Security (RLS) on all tables
    - Proper access policies for learners, tutors, and admins
    
  3. Features
    - Free and paid courses
    - Lifetime and time-limited access
    - Progress tracking
    - Session management
    - Review system
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing MLM-related tables (keeping user management)
DROP TABLE IF EXISTS tbl_mlm_tree CASCADE;
DROP TABLE IF EXISTS tbl_companies CASCADE;

-- Create course categories table
CREATE TABLE tbl_course_categories (
  tcc_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tcc_name text NOT NULL,
  tcc_description text,
  tcc_icon text, -- Icon name for UI
  tcc_color text DEFAULT '#3B82F6', -- Category color
  tcc_is_active boolean DEFAULT true,
  tcc_sort_order integer DEFAULT 0,
  tcc_created_at timestamptz DEFAULT now(),
  tcc_updated_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE tbl_courses (
  tc_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tc_category_id uuid REFERENCES tbl_course_categories(tcc_id) ON DELETE SET NULL,
  tc_title text NOT NULL,
  tc_description text,
  tc_short_description text,
  tc_thumbnail_url text,
  tc_price decimal(10,2) DEFAULT 0.00,
  tc_pricing_type text DEFAULT 'free' CHECK (tc_pricing_type IN ('free', 'paid_days', 'lifetime')),
  tc_access_days integer, -- For paid_days type
  tc_difficulty_level text DEFAULT 'beginner' CHECK (tc_difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  tc_duration_hours integer DEFAULT 0,
  tc_total_lessons integer DEFAULT 0,
  tc_prerequisites text,
  tc_learning_outcomes jsonb DEFAULT '[]',
  tc_tags jsonb DEFAULT '[]',
  tc_is_active boolean DEFAULT true,
  tc_featured boolean DEFAULT false,
  tc_created_by uuid REFERENCES tbl_users(tu_id),
  tc_created_at timestamptz DEFAULT now(),
  tc_updated_at timestamptz DEFAULT now()
);

-- Create tutors table
CREATE TABLE tbl_tutors (
  tt_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tt_user_id uuid REFERENCES tbl_users(tu_id) ON DELETE CASCADE,
  tt_bio text,
  tt_specializations jsonb DEFAULT '[]', -- Array of subject specializations
  tt_experience_years integer DEFAULT 0,
  tt_education text,
  tt_certifications jsonb DEFAULT '[]',
  tt_hourly_rate decimal(10,2) DEFAULT 0.00,
  tt_availability jsonb DEFAULT '{}', -- Weekly availability schedule
  tt_languages jsonb DEFAULT '["English"]',
  tt_rating decimal(3,2) DEFAULT 0.00,
  tt_total_reviews integer DEFAULT 0,
  tt_total_students integer DEFAULT 0,
  tt_is_verified boolean DEFAULT false,
  tt_is_active boolean DEFAULT true,
  tt_created_at timestamptz DEFAULT now(),
  tt_updated_at timestamptz DEFAULT now()
);

-- Create course enrollments table
CREATE TABLE tbl_course_enrollments (
  tce_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tce_user_id uuid REFERENCES tbl_users(tu_id) ON DELETE CASCADE,
  tce_course_id uuid REFERENCES tbl_courses(tc_id) ON DELETE CASCADE,
  tce_enrollment_date timestamptz DEFAULT now(),
  tce_access_expires_at timestamptz, -- For time-limited courses
  tce_payment_amount decimal(10,2) DEFAULT 0.00,
  tce_payment_status text DEFAULT 'completed' CHECK (tce_payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  tce_progress_percentage decimal(5,2) DEFAULT 0.00,
  tce_completed_at timestamptz,
  tce_certificate_issued boolean DEFAULT false,
  tce_is_active boolean DEFAULT true,
  tce_created_at timestamptz DEFAULT now(),
  tce_updated_at timestamptz DEFAULT now(),
  UNIQUE(tce_user_id, tce_course_id)
);

-- Create tutor assignments table
CREATE TABLE tbl_tutor_assignments (
  tta_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tta_tutor_id uuid REFERENCES tbl_tutors(tt_id) ON DELETE CASCADE,
  tta_learner_id uuid REFERENCES tbl_users(tu_id) ON DELETE CASCADE,
  tta_course_id uuid REFERENCES tbl_courses(tc_id) ON DELETE CASCADE,
  tta_assigned_by uuid REFERENCES tbl_users(tu_id), -- Admin who made assignment
  tta_assignment_date timestamptz DEFAULT now(),
  tta_status text DEFAULT 'active' CHECK (tta_status IN ('active', 'completed', 'cancelled')),
  tta_notes text,
  tta_is_active boolean DEFAULT true,
  tta_created_at timestamptz DEFAULT now(),
  tta_updated_at timestamptz DEFAULT now()
);

-- Create course content table
CREATE TABLE tbl_course_content (
  tcc_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tcc_course_id uuid REFERENCES tbl_courses(tc_id) ON DELETE CASCADE,
  tcc_title text NOT NULL,
  tcc_description text,
  tcc_content_type text NOT NULL CHECK (tcc_content_type IN ('video', 'document', 'quiz', 'assignment', 'live_session')),
  tcc_content_url text, -- Video URL, document link, etc.
  tcc_duration_minutes integer DEFAULT 0,
  tcc_sort_order integer DEFAULT 0,
  tcc_is_free boolean DEFAULT false, -- Some content can be free preview
  tcc_is_active boolean DEFAULT true,
  tcc_created_at timestamptz DEFAULT now(),
  tcc_updated_at timestamptz DEFAULT now()
);

-- Create learning progress table
CREATE TABLE tbl_learning_progress (
  tlp_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tlp_user_id uuid REFERENCES tbl_users(tu_id) ON DELETE CASCADE,
  tlp_course_id uuid REFERENCES tbl_courses(tc_id) ON DELETE CASCADE,
  tlp_content_id uuid REFERENCES tbl_course_content(tcc_id) ON DELETE CASCADE,
  tlp_completed boolean DEFAULT false,
  tlp_completion_date timestamptz,
  tlp_time_spent_minutes integer DEFAULT 0,
  tlp_notes text,
  tlp_created_at timestamptz DEFAULT now(),
  tlp_updated_at timestamptz DEFAULT now(),
  UNIQUE(tlp_user_id, tlp_content_id)
);

-- Create sessions table for live classes
CREATE TABLE tbl_sessions (
  ts_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ts_course_id uuid REFERENCES tbl_courses(tc_id) ON DELETE CASCADE,
  ts_tutor_id uuid REFERENCES tbl_tutors(tt_id) ON DELETE CASCADE,
  ts_title text NOT NULL,
  ts_description text,
  ts_session_type text DEFAULT 'live' CHECK (ts_session_type IN ('live', 'recorded')),
  ts_scheduled_at timestamptz,
  ts_duration_minutes integer DEFAULT 60,
  ts_meeting_url text, -- Zoom, Google Meet, etc.
  ts_recording_url text, -- For recorded sessions
  ts_max_participants integer DEFAULT 50,
  ts_current_participants integer DEFAULT 0,
  ts_status text DEFAULT 'scheduled' CHECK (ts_status IN ('scheduled', 'live', 'completed', 'cancelled')),
  ts_is_active boolean DEFAULT true,
  ts_created_at timestamptz DEFAULT now(),
  ts_updated_at timestamptz DEFAULT now()
);

-- Create session participants table
CREATE TABLE tbl_session_participants (
  tsp_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tsp_session_id uuid REFERENCES tbl_sessions(ts_id) ON DELETE CASCADE,
  tsp_user_id uuid REFERENCES tbl_users(tu_id) ON DELETE CASCADE,
  tsp_joined_at timestamptz,
  tsp_left_at timestamptz,
  tsp_attendance_duration interval GENERATED ALWAYS AS (tsp_left_at - tsp_joined_at) STORED,
  tsp_created_at timestamptz DEFAULT now(),
  UNIQUE(tsp_session_id, tsp_user_id)
);

-- Create reviews and ratings table
CREATE TABLE tbl_reviews_ratings (
  trr_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  trr_user_id uuid REFERENCES tbl_users(tu_id) ON DELETE CASCADE,
  trr_course_id uuid REFERENCES tbl_courses(tc_id) ON DELETE CASCADE,
  trr_tutor_id uuid REFERENCES tbl_tutors(tt_id) ON DELETE CASCADE,
  trr_rating integer CHECK (trr_rating >= 1 AND trr_rating <= 5),
  trr_review_text text,
  trr_review_type text NOT NULL CHECK (trr_review_type IN ('course', 'tutor')),
  trr_is_verified boolean DEFAULT false,
  trr_is_active boolean DEFAULT true,
  trr_created_at timestamptz DEFAULT now(),
  trr_updated_at timestamptz DEFAULT now()
);

-- Update user_profiles to remove MLM-specific fields and add learner fields
ALTER TABLE tbl_user_profiles 
DROP COLUMN IF EXISTS tup_sponsorship_number,
DROP COLUMN IF EXISTS tup_parent_account;

ALTER TABLE tbl_user_profiles 
ADD COLUMN IF NOT EXISTS tup_date_of_birth date,
ADD COLUMN IF NOT EXISTS tup_education_level text,
ADD COLUMN IF NOT EXISTS tup_interests jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS tup_learning_goals text,
ADD COLUMN IF NOT EXISTS tup_timezone text DEFAULT 'UTC';

-- Update subscription plans for education platform
UPDATE tbl_subscription_plans SET
  tsp_name = 'Basic Learning Plan',
  tsp_description = 'Access to free courses and basic features',
  tsp_features = '["Free Course Access", "Basic Dashboard", "Email Support", "Mobile App Access"]'
WHERE tsp_name = 'Basic Plan';

UPDATE tbl_subscription_plans SET
  tsp_name = 'Premium Learning Plan', 
  tsp_description = 'Access to premium courses and advanced features',
  tsp_features = '["All Course Access", "Advanced Dashboard", "Priority Support", "Progress Analytics", "Mobile App Access", "Downloadable Content"]'
WHERE tsp_name = 'Premium Plan';

UPDATE tbl_subscription_plans SET
  tsp_name = 'Pro Learning Plan',
  tsp_description = 'Complete learning solution with personal tutoring',
  tsp_features = '["All Course Access", "Personal Tutor Assignment", "1-on-1 Sessions", "Advanced Analytics", "Mobile App Access", "Downloadable Content", "Certificate Generation", "Priority Support"]'
WHERE tsp_name = 'Enterprise Plan';

-- Create indexes for performance
CREATE INDEX idx_tbl_courses_category_id ON tbl_courses(tc_category_id);
CREATE INDEX idx_tbl_courses_pricing_type ON tbl_courses(tc_pricing_type);
CREATE INDEX idx_tbl_courses_is_active ON tbl_courses(tc_is_active);
CREATE INDEX idx_tbl_courses_featured ON tbl_courses(tc_featured);
CREATE INDEX idx_tbl_course_enrollments_user_id ON tbl_course_enrollments(tce_user_id);
CREATE INDEX idx_tbl_course_enrollments_course_id ON tbl_course_enrollments(tce_course_id);
CREATE INDEX idx_tbl_tutors_user_id ON tbl_tutors(tt_user_id);
CREATE INDEX idx_tbl_tutor_assignments_tutor_id ON tbl_tutor_assignments(tta_tutor_id);
CREATE INDEX idx_tbl_tutor_assignments_learner_id ON tbl_tutor_assignments(tta_learner_id);
CREATE INDEX idx_tbl_course_content_course_id ON tbl_course_content(tcc_course_id);
CREATE INDEX idx_tbl_learning_progress_user_id ON tbl_learning_progress(tlp_user_id);
CREATE INDEX idx_tbl_learning_progress_course_id ON tbl_learning_progress(tlp_course_id);
CREATE INDEX idx_tbl_sessions_tutor_id ON tbl_sessions(ts_tutor_id);
CREATE INDEX idx_tbl_sessions_scheduled_at ON tbl_sessions(ts_scheduled_at);
CREATE INDEX idx_tbl_reviews_ratings_course_id ON tbl_reviews_ratings(trr_course_id);
CREATE INDEX idx_tbl_reviews_ratings_tutor_id ON tbl_reviews_ratings(trr_tutor_id);

-- Enable Row Level Security
ALTER TABLE tbl_course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_tutor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_reviews_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course categories (public read)
CREATE POLICY "Anyone can read active categories" ON tbl_course_categories
  FOR SELECT TO authenticated
  USING (tcc_is_active = true);

-- RLS Policies for courses (public read for active courses)
CREATE POLICY "Anyone can read active courses" ON tbl_courses
  FOR SELECT TO authenticated
  USING (tc_is_active = true);

-- RLS Policies for tutors (public read for active tutors)
CREATE POLICY "Anyone can read active tutors" ON tbl_tutors
  FOR SELECT TO authenticated
  USING (tt_is_active = true);

CREATE POLICY "Tutors can update own profile" ON tbl_tutors
  FOR UPDATE TO authenticated
  USING (auth.uid() = tt_user_id);

-- RLS Policies for course enrollments
CREATE POLICY "Users can read own enrollments" ON tbl_course_enrollments
  FOR SELECT TO authenticated
  USING (auth.uid() = tce_user_id);

CREATE POLICY "Users can insert own enrollments" ON tbl_course_enrollments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tce_user_id);

-- RLS Policies for tutor assignments
CREATE POLICY "Users can read own assignments" ON tbl_tutor_assignments
  FOR SELECT TO authenticated
  USING (auth.uid() = tta_learner_id OR auth.uid() = (SELECT tt_user_id FROM tbl_tutors WHERE tt_id = tta_tutor_id));

-- RLS Policies for course content
CREATE POLICY "Enrolled users can read course content" ON tbl_course_content
  FOR SELECT TO authenticated
  USING (
    tcc_is_free = true OR
    EXISTS (
      SELECT 1 FROM tbl_course_enrollments
      WHERE tce_user_id = auth.uid()
        AND tce_course_id = tcc_course_id
        AND tce_is_active = true
        AND (tce_access_expires_at IS NULL OR tce_access_expires_at > now())
    )
  );

-- RLS Policies for learning progress
CREATE POLICY "Users can manage own progress" ON tbl_learning_progress
  FOR ALL TO authenticated
  USING (auth.uid() = tlp_user_id)
  WITH CHECK (auth.uid() = tlp_user_id);

-- RLS Policies for sessions
CREATE POLICY "Anyone can read active sessions" ON tbl_sessions
  FOR SELECT TO authenticated
  USING (ts_is_active = true);

-- RLS Policies for session participants
CREATE POLICY "Users can read own session participation" ON tbl_session_participants
  FOR SELECT TO authenticated
  USING (auth.uid() = tsp_user_id);

CREATE POLICY "Users can insert own session participation" ON tbl_session_participants
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tsp_user_id);

-- RLS Policies for reviews and ratings
CREATE POLICY "Anyone can read active reviews" ON tbl_reviews_ratings
  FOR SELECT TO authenticated
  USING (trr_is_active = true);

CREATE POLICY "Users can insert own reviews" ON tbl_reviews_ratings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = trr_user_id);

-- Insert default course categories
INSERT INTO tbl_course_categories (tcc_name, tcc_description, tcc_icon, tcc_color, tcc_sort_order) VALUES
('Programming', 'Web development, mobile apps, and software engineering', 'Code', '#3B82F6', 1),
('Web Development', 'Frontend, backend, and full-stack development', 'Globe', '#10B981', 2),
('Data Science', 'Analytics, machine learning, and data visualization', 'BarChart3', '#8B5CF6', 3),
('Mathematics', 'Algebra, calculus, statistics, and applied mathematics', 'Calculator', '#F59E0B', 4),
('Science', 'Physics, chemistry, biology, and earth sciences', 'Atom', '#EF4444', 5),
('Business', 'Management, marketing, finance, and entrepreneurship', 'Briefcase', '#06B6D4', 6),
('Languages', 'English, Spanish, French, and other world languages', 'Languages', '#EC4899', 7),
('Design', 'Graphic design, UI/UX, and creative arts', 'Palette', '#84CC16', 8);

-- Insert sample courses
INSERT INTO tbl_courses (tc_category_id, tc_title, tc_description, tc_short_description, tc_thumbnail_url, tc_price, tc_pricing_type, tc_access_days, tc_difficulty_level, tc_duration_hours, tc_total_lessons, tc_learning_outcomes, tc_tags, tc_featured) VALUES
(
  (SELECT tcc_id FROM tbl_course_categories WHERE tcc_name = 'Programming'),
  'JavaScript Fundamentals',
  'Learn the basics of JavaScript programming from scratch. This comprehensive course covers variables, functions, objects, and modern ES6+ features.',
  'Master JavaScript basics and modern features',
  'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  0.00,
  'free',
  NULL,
  'beginner',
  20,
  15,
  '["Understand JavaScript syntax", "Work with variables and functions", "Master objects and arrays", "Use modern ES6+ features"]',
  '["javascript", "programming", "web-development", "beginner"]',
  true
),
(
  (SELECT tcc_id FROM tbl_course_categories WHERE tcc_name = 'Programming'),
  'Advanced React Development',
  'Deep dive into React.js with hooks, context, performance optimization, and testing. Build production-ready applications.',
  'Build professional React applications',
  'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  199.00,
  'lifetime',
  NULL,
  'advanced',
  40,
  30,
  '["Master React hooks and context", "Optimize application performance", "Implement testing strategies", "Deploy production apps"]',
  '["react", "javascript", "frontend", "advanced"]',
  true
),
(
  (SELECT tcc_id FROM tbl_course_categories WHERE tcc_name = 'Web Development'),
  'PHP & MySQL Development',
  'Complete PHP and MySQL course covering backend development, database design, and web application security.',
  'Build dynamic web applications with PHP',
  'https://images.pexels.com/photos/270632/pexels-photo-270632.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  149.00,
  'paid_days',
  90,
  'intermediate',
  35,
  25,
  '["Build PHP web applications", "Design MySQL databases", "Implement user authentication", "Secure web applications"]',
  '["php", "mysql", "backend", "web-development"]',
  false
),
(
  (SELECT tcc_id FROM tbl_course_categories WHERE tcc_name = 'Programming'),
  '.NET Core Development',
  'Learn modern .NET Core development with C#, Entity Framework, and ASP.NET Core for building scalable applications.',
  'Master .NET Core and C# development',
  'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  249.00,
  'lifetime',
  NULL,
  'intermediate',
  45,
  35,
  '["Build .NET Core applications", "Master C# programming", "Use Entity Framework", "Create REST APIs"]',
  '["dotnet", "csharp", "backend", "microsoft"]',
  true
),
(
  (SELECT tcc_id FROM tbl_course_categories WHERE tcc_name = 'Science'),
  'Chemistry Fundamentals',
  'Comprehensive chemistry course covering atomic structure, chemical bonding, reactions, and laboratory techniques.',
  'Master chemistry concepts and lab skills',
  'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  99.00,
  'paid_days',
  60,
  'beginner',
  30,
  20,
  '["Understand atomic structure", "Master chemical bonding", "Perform lab experiments", "Solve chemistry problems"]',
  '["chemistry", "science", "laboratory", "atoms"]',
  false
),
(
  (SELECT tcc_id FROM tbl_course_categories WHERE tcc_name = 'Science'),
  'Physics Mastery',
  'Complete physics course covering mechanics, thermodynamics, electromagnetism, and modern physics concepts.',
  'Comprehensive physics education',
  'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  129.00,
  'lifetime',
  NULL,
  'intermediate',
  50,
  40,
  '["Master physics principles", "Solve complex problems", "Understand modern physics", "Apply mathematical concepts"]',
  '["physics", "science", "mathematics", "mechanics"]',
  true
),
(
  (SELECT tcc_id FROM tbl_course_categories WHERE tcc_name = 'Mathematics'),
  'Calculus Complete Course',
  'From limits to integration, master calculus concepts with practical applications and problem-solving techniques.',
  'Master calculus from basics to advanced',
  'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  179.00,
  'lifetime',
  NULL,
  'intermediate',
  60,
  45,
  '["Master limits and derivatives", "Understand integration techniques", "Solve real-world problems", "Apply calculus concepts"]',
  '["calculus", "mathematics", "derivatives", "integration"]',
  true
),
(
  (SELECT tcc_id FROM tbl_course_categories WHERE tcc_name = 'Web Development'),
  'jQuery Mastery',
  'Learn jQuery for dynamic web interactions, animations, and AJAX. Perfect for enhancing user experience.',
  'Create interactive web experiences',
  'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
  79.00,
  'paid_days',
  45,
  'beginner',
  15,
  12,
  '["Master jQuery selectors", "Create animations", "Handle AJAX requests", "Build interactive UIs"]',
  '["jquery", "javascript", "frontend", "animations"]',
  false
);

-- Insert sample tutors
INSERT INTO tbl_tutors (tt_user_id, tt_bio, tt_specializations, tt_experience_years, tt_education, tt_hourly_rate, tt_languages, tt_is_verified) VALUES
(
  (SELECT tu_id FROM tbl_users WHERE tu_email = 'admin@mlmplatform.com'),
  'Experienced software engineer with 10+ years in web development and education. Passionate about teaching programming concepts.',
  '["JavaScript", "React", "Node.js", "Python", "Web Development"]',
  10,
  'Master of Computer Science, Stanford University',
  75.00,
  '["English", "Spanish"]',
  true
);

-- Database Functions

-- Function to enroll user in course
CREATE OR REPLACE FUNCTION enroll_in_course(
  p_user_id uuid,
  p_course_id uuid,
  p_payment_amount decimal DEFAULT 0.00
) RETURNS jsonb AS $$
DECLARE
  v_course record;
  v_access_expires_at timestamptz;
BEGIN
  -- Get course details
  SELECT * INTO v_course FROM tbl_courses WHERE tc_id = p_course_id AND tc_is_active = true;
  
  IF v_course IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Course not found or inactive');
  END IF;
  
  -- Check if already enrolled
  IF EXISTS (SELECT 1 FROM tbl_course_enrollments WHERE tce_user_id = p_user_id AND tce_course_id = p_course_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already enrolled in this course');
  END IF;
  
  -- Calculate access expiry for paid_days courses
  IF v_course.tc_pricing_type = 'paid_days' AND v_course.tc_access_days IS NOT NULL THEN
    v_access_expires_at := now() + (v_course.tc_access_days || ' days')::interval;
  END IF;
  
  -- Insert enrollment
  INSERT INTO tbl_course_enrollments (
    tce_user_id,
    tce_course_id,
    tce_access_expires_at,
    tce_payment_amount,
    tce_payment_status
  ) VALUES (
    p_user_id,
    p_course_id,
    v_access_expires_at,
    p_payment_amount,
    CASE WHEN p_payment_amount > 0 THEN 'pending' ELSE 'completed' END
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Successfully enrolled in course',
    'access_expires_at', v_access_expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update learning progress
CREATE OR REPLACE FUNCTION update_learning_progress(
  p_user_id uuid,
  p_course_id uuid,
  p_content_id uuid,
  p_completed boolean DEFAULT true,
  p_time_spent_minutes integer DEFAULT 0
) RETURNS jsonb AS $$
BEGIN
  -- Upsert progress record
  INSERT INTO tbl_learning_progress (
    tlp_user_id,
    tlp_course_id,
    tlp_content_id,
    tlp_completed,
    tlp_completion_date,
    tlp_time_spent_minutes
  ) VALUES (
    p_user_id,
    p_course_id,
    p_content_id,
    p_completed,
    CASE WHEN p_completed THEN now() ELSE NULL END,
    p_time_spent_minutes
  )
  ON CONFLICT (tlp_user_id, tlp_content_id)
  DO UPDATE SET
    tlp_completed = p_completed,
    tlp_completion_date = CASE WHEN p_completed THEN now() ELSE NULL END,
    tlp_time_spent_minutes = tbl_learning_progress.tlp_time_spent_minutes + p_time_spent_minutes,
    tlp_updated_at = now();
  
  -- Update enrollment progress percentage
  UPDATE tbl_course_enrollments SET
    tce_progress_percentage = (
      SELECT 
        ROUND(
          (COUNT(*) FILTER (WHERE tlp_completed = true) * 100.0) / 
          GREATEST(COUNT(*), 1), 
          2
        )
      FROM tbl_learning_progress
      WHERE tlp_user_id = p_user_id AND tlp_course_id = p_course_id
    ),
    tce_updated_at = now()
  WHERE tce_user_id = p_user_id AND tce_course_id = p_course_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Progress updated successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign tutor to learner
CREATE OR REPLACE FUNCTION assign_tutor_to_learner(
  p_tutor_id uuid,
  p_learner_id uuid,
  p_course_id uuid,
  p_assigned_by uuid,
  p_notes text DEFAULT NULL
) RETURNS jsonb AS $$
BEGIN
  -- Check if tutor exists and is active
  IF NOT EXISTS (SELECT 1 FROM tbl_tutors WHERE tt_id = p_tutor_id AND tt_is_active = true) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tutor not found or inactive');
  END IF;
  
  -- Check if learner is enrolled in course
  IF NOT EXISTS (SELECT 1 FROM tbl_course_enrollments WHERE tce_user_id = p_learner_id AND tce_course_id = p_course_id AND tce_is_active = true) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Learner not enrolled in this course');
  END IF;
  
  -- Insert assignment
  INSERT INTO tbl_tutor_assignments (
    tta_tutor_id,
    tta_learner_id,
    tta_course_id,
    tta_assigned_by,
    tta_notes
  ) VALUES (
    p_tutor_id,
    p_learner_id,
    p_course_id,
    p_assigned_by,
    p_notes
  );
  
  RETURN jsonb_build_object('success', true, 'message', 'Tutor assigned successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION enroll_in_course TO authenticated;
GRANT EXECUTE ON FUNCTION update_learning_progress TO authenticated;
GRANT EXECUTE ON FUNCTION assign_tutor_to_learner TO authenticated;

-- Update triggers for new tables
CREATE TRIGGER trigger_course_categories_updated_at
  BEFORE UPDATE ON tbl_course_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at_column();

CREATE TRIGGER trigger_courses_updated_at
  BEFORE UPDATE ON tbl_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at_column();

CREATE TRIGGER trigger_tutors_updated_at
  BEFORE UPDATE ON tbl_tutors
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at_column();

CREATE TRIGGER trigger_course_enrollments_updated_at
  BEFORE UPDATE ON tbl_course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at_column();

CREATE TRIGGER trigger_tutor_assignments_updated_at
  BEFORE UPDATE ON tbl_tutor_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at_column();

CREATE TRIGGER trigger_course_content_updated_at
  BEFORE UPDATE ON tbl_course_content
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at_column();

CREATE TRIGGER trigger_learning_progress_updated_at
  BEFORE UPDATE ON tbl_learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at_column();

CREATE TRIGGER trigger_sessions_updated_at
  BEFORE UPDATE ON tbl_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at_column();

CREATE TRIGGER trigger_reviews_ratings_updated_at
  BEFORE UPDATE ON tbl_reviews_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at_column();

-- Success message
SELECT 'Education platform database schema created successfully! All tables, functions, and sample data have been set up.' as status;