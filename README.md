# HTG Infotech - Online Learning Platform

A comprehensive online learning platform built with React, TypeScript, and Supabase, featuring personalized tutoring and course management by HTG Infotech.

## Features

- **Multi-User System**: Support for Learners, Tutors, and Admins
- **Course Management**: Comprehensive course catalog with categories and pricing
- **Tutor-Learner Matching**: Automated tutor assignment system
- **Progress Tracking**: Detailed learning analytics and progress monitoring
- **Session Management**: Live and recorded session support
- **Certificate System**: Verified certificates upon course completion
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Database Structure

The platform uses Supabase (PostgreSQL) with the following main tables:

### Core Tables

1. **tbl_users** - Main authentication table
   - `tu_id` (uuid, primary key)
   - `tu_email` (text, unique)
   - `tu_user_type` (learner/tutor/admin)
   - `tu_is_verified`, `tu_email_verified`, `tu_mobile_verified` (boolean)

2. **tbl_user_profiles** - Extended user information
   - `tup_user_id` (foreign key to users)
   - `tup_first_name`, `tup_last_name`, `tup_username`
   - `tup_mobile`, `tup_gender`, `tup_education_level`
   - `tup_interests`, `tup_learning_goals`

3. **tbl_course_categories** - Course subject categories
   - `tcc_name`, `tcc_description`, `tcc_icon`
   - `tcc_color`, `tcc_sort_order`

4. **tbl_courses** - Course catalog
   - `tc_title`, `tc_description`, `tc_thumbnail_url`
   - `tc_price`, `tc_pricing_type` (free/paid_days/lifetime)
   - `tc_difficulty_level`, `tc_duration_hours`
   - `tc_learning_outcomes`, `tc_tags`

5. **tbl_tutors** - Tutor profiles
   - `tt_user_id`, `tt_bio`, `tt_specializations`
   - `tt_experience_years`, `tt_hourly_rate`
   - `tt_rating`, `tt_total_students`

6. **tbl_course_enrollments** - Student enrollments
   - `tce_user_id`, `tce_course_id`
   - `tce_progress_percentage`, `tce_payment_status`
   - `tce_access_expires_at`

7. **tbl_tutor_assignments** - Tutor-learner assignments
   - `tta_tutor_id`, `tta_learner_id`, `tta_course_id`
   - `tta_assigned_by`, `tta_status`

8. **tbl_sessions** - Live/recorded sessions
   - `ts_course_id`, `ts_tutor_id`, `ts_title`
   - `ts_scheduled_at`, `ts_duration_minutes`
   - `ts_meeting_url`, `ts_recording_url`

### Database Access

To view the database structure:

1. **Supabase Dashboard**: 
   - Go to your Supabase project dashboard
   - Navigate to "Table Editor" to see all tables
   - Use "SQL Editor" to run custom queries

2. **Database Schema**: 
   - Check the migration file: `supabase/migrations/create_education_platform_schema.sql`
   - Contains complete table definitions, relationships, and functions

## Setup Instructions

### 1. Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Click "Connect to Supabase" button in the top right of this application
3. Run the education platform migration in SQL Editor

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. SMS & Email Gateway Configuration

The platform uses Supabase integrations for reliable email and SMS delivery:

**Email Service (Resend.com)**:
- Create account at [Resend.com](https://resend.com)
- Get your API key from Resend dashboard
- Configure in Supabase Dashboard → Settings → Integrations → Resend
- Add your domain and verify DNS records
- Test email delivery through Supabase

**SMS Service (Twilio)**:
- Create account at [Twilio.com](https://www.twilio.com)
- Get Account SID and Auth Token from Console
- Purchase a phone number or use trial number
- Configure in Supabase Dashboard → Settings → Integrations → Twilio
- Test SMS delivery through Supabase

### 4. Admin Panel Access

Default admin credentials:
- URL: `your-domain.com/backpanel/login`
- Email: `admin@mlmplatform.com`
- Password: `Admin@123456`

**Important**: Change the default password after first login!

## Key Features

### Course Management
- **Multiple Categories**: Programming, Science, Mathematics, Languages, etc.
- **Flexible Pricing**: Free courses, time-limited access, or lifetime purchases
- **Content Types**: Videos, documents, quizzes, assignments, live sessions

### Tutor System
- **Expert Verification**: Thorough vetting process for tutor qualifications
- **Flexible Scheduling**: Tutors set their own availability and rates
- **Student Matching**: Automated assignment based on course and expertise

### Learning Experience
- **Progress Tracking**: Detailed analytics on learning progress and time spent
- **Certificates**: Verified certificates upon course completion
- **Interactive Content**: Mix of self-paced and live learning options

### Admin Dashboard
- **Course Management**: Add, edit, and organize course catalog
- **Tutor Management**: Verify and manage tutor applications
- **Student Analytics**: Monitor learning progress and platform usage
- **System Settings**: Configure platform parameters and pricing

## API Endpoints

### Edge Functions (Supabase)

1. **send-otp**: Send OTP via email or SMS
2. **verify-otp**: Verify submitted OTP codes

### Database Functions

1. **enroll_in_course()**: Enroll students in courses with payment tracking
2. **update_learning_progress()**: Track student progress through courses
3. **assign_tutor_to_learner()**: Assign tutors to students for specific courses

## Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure session management
- **Input Validation**: Comprehensive data validation
- **Content Protection**: Secure access to paid course materials

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Testing Credentials

For testing the platform:

**Test Learner**: Any valid email address
**Test Tutor**: Apply through tutor registration
**Test Admin**: admin@mlmplatform.com / Admin@123456

## Course Categories

The platform supports various subject categories:

- **Programming**: JavaScript, Python, Java, C++, .NET
- **Web Development**: HTML/CSS, React, Node.js, PHP
- **Data Science**: Analytics, Machine Learning, Statistics
- **Mathematics**: Algebra, Calculus, Statistics
- **Science**: Physics, Chemistry, Biology
- **Languages**: English, Spanish, French, etc.
- **Business**: Management, Marketing, Finance
- **Design**: Graphic Design, UI/UX

## Support

For technical support or questions about the platform:
1. Check the migration files in `supabase/migrations/`
2. Review the API functions in `supabase/functions/`
3. Examine the database schema in Supabase dashboard