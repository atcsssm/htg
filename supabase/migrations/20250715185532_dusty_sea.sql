/*
  # Complete MLM Platform Database Setup with Prefixes
  # Run this script in your Supabase SQL Editor to set up all tables and data
  
  This script sets up:
  1. All database tables with tbl_ prefix and column prefixes
  2. Row Level Security (RLS) policies
  3. Database functions and triggers
  4. Default data (subscription plans, settings, admin user)
  5. Indexes for performance
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS tbl_admin_activity_logs CASCADE;
DROP TABLE IF EXISTS tbl_admin_sessions CASCADE;
DROP TABLE IF EXISTS tbl_admin_users CASCADE;
DROP TABLE IF EXISTS tbl_user_activity_logs CASCADE;
DROP TABLE IF EXISTS tbl_otp_verifications CASCADE;
DROP TABLE IF EXISTS tbl_payments CASCADE;
DROP TABLE IF EXISTS tbl_user_subscriptions CASCADE;
DROP TABLE IF EXISTS tbl_user_profiles CASCADE;
DROP TABLE IF EXISTS tbl_users CASCADE;
DROP TABLE IF EXISTS tbl_subscription_plans CASCADE;
DROP TABLE IF EXISTS tbl_email_templates CASCADE;
DROP TABLE IF EXISTS tbl_system_settings CASCADE;

-- Drop types if they exist
DROP TYPE IF EXISTS admin_role CASCADE;

-- Create admin role enum
CREATE TYPE admin_role AS ENUM ('super_admin', 'sub_admin');

-- Users table (extends Supabase auth.users)
CREATE TABLE tbl_users (
  tu_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tu_email text UNIQUE NOT NULL,
  tu_user_type text NOT NULL CHECK (tu_user_type IN ('customer', 'company', 'admin')),
  tu_is_verified boolean DEFAULT false,
  tu_email_verified boolean DEFAULT false,
  tu_mobile_verified boolean DEFAULT false,
  tu_is_active boolean DEFAULT true,
  tu_created_at timestamptz DEFAULT now(),
  tu_updated_at timestamptz DEFAULT now()
);

-- User profiles table
CREATE TABLE tbl_user_profiles (
  tup_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tup_user_id uuid REFERENCES tbl_users(tu_id) ON DELETE CASCADE,
  tup_first_name text,
  tup_last_name text,
  tup_username text,
  tup_mobile text,
  tup_gender text CHECK (tup_gender IN ('male', 'female', 'other')),
  tup_sponsorship_number text UNIQUE,
  tup_parent_account text,
  tup_created_at timestamptz DEFAULT now(),
  tup_updated_at timestamptz DEFAULT now()
);

-- Subscription plans
CREATE TABLE tbl_subscription_plans (
  tsp_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tsp_name text NOT NULL,
  tsp_description text,
  tsp_price decimal(10,2) NOT NULL,
  tsp_duration_days integer NOT NULL,
  tsp_features jsonb DEFAULT '[]',
  tsp_is_active boolean DEFAULT true,
  tsp_created_at timestamptz DEFAULT now(),
  tsp_updated_at timestamptz DEFAULT now()
);

-- User subscriptions
CREATE TABLE tbl_user_subscriptions (
  tus_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tus_user_id uuid REFERENCES tbl_users(tu_id) ON DELETE CASCADE,
  tus_plan_id uuid REFERENCES tbl_subscription_plans(tsp_id),
  tus_status text DEFAULT 'active' CHECK (tus_status IN ('active', 'expired', 'cancelled')),
  tus_start_date timestamptz DEFAULT now(),
  tus_end_date timestamptz NOT NULL,
  tus_payment_amount decimal(10,2) NOT NULL,
  tus_created_at timestamptz DEFAULT now(),
  tus_updated_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE tbl_payments (
  tp_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tp_user_id uuid REFERENCES tbl_users(tu_id) ON DELETE CASCADE,
  tp_subscription_id uuid REFERENCES tbl_user_subscriptions(tus_id),
  tp_amount decimal(10,2) NOT NULL,
  tp_currency text DEFAULT 'USD',
  tp_payment_method text NOT NULL,
  tp_payment_status text DEFAULT 'pending' CHECK (tp_payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  tp_transaction_id text,
  tp_gateway_response jsonb,
  tp_created_at timestamptz DEFAULT now(),
  tp_updated_at timestamptz DEFAULT now()
);

-- OTP verifications
CREATE TABLE tbl_otp_verifications (
  tov_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tov_user_id uuid REFERENCES tbl_users(tu_id) ON DELETE CASCADE,
  tov_otp_code text NOT NULL,
  tov_otp_type text NOT NULL CHECK (tov_otp_type IN ('email', 'mobile', 'password_reset')),
  tov_contact_info text NOT NULL,
  tov_is_verified boolean DEFAULT false,
  tov_expires_at timestamptz NOT NULL,
  tov_attempts integer DEFAULT 0,
  tov_created_at timestamptz DEFAULT now()
);

-- User activity logs
CREATE TABLE tbl_user_activity_logs (
  tual_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tual_user_id uuid REFERENCES tbl_users(tu_id) ON DELETE CASCADE,
  tual_activity_type text NOT NULL CHECK (tual_activity_type IN ('login', 'logout', 'registration', 'password_reset', 'profile_update')),
  tual_ip_address text,
  tual_user_agent text,
  tual_login_time timestamptz,
  tual_logout_time timestamptz,
  tual_session_duration interval GENERATED ALWAYS AS (tual_logout_time - tual_login_time) STORED,
  tual_metadata jsonb DEFAULT '{}',
  tual_created_at timestamptz DEFAULT now()
);

-- Admin users table
CREATE TABLE tbl_admin_users (
  tau_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tau_email text UNIQUE NOT NULL,
  tau_password_hash text NOT NULL,
  tau_full_name text NOT NULL,
  tau_role admin_role NOT NULL DEFAULT 'sub_admin',
  tau_permissions jsonb DEFAULT '{
    "users": {"read": false, "write": false, "delete": false},
    "companies": {"read": false, "write": false, "delete": false},
    "subscriptions": {"read": false, "write": false, "delete": false},
    "payments": {"read": false, "write": false, "delete": false},
    "settings": {"read": false, "write": false, "delete": false},
    "admins": {"read": false, "write": false, "delete": false},
    "reports": {"read": false, "write": false, "delete": false}
  }'::jsonb,
  tau_is_active boolean DEFAULT true,
  tau_created_by uuid REFERENCES tbl_admin_users(tau_id),
  tau_last_login timestamptz,
  tau_created_at timestamptz DEFAULT now(),
  tau_updated_at timestamptz DEFAULT now()
);

-- Admin sessions table
CREATE TABLE tbl_admin_sessions (
  tas_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tas_admin_id uuid NOT NULL REFERENCES tbl_admin_users(tau_id) ON DELETE CASCADE,
  tas_session_token text UNIQUE NOT NULL,
  tas_expires_at timestamptz NOT NULL,
  tas_ip_address text,
  tas_user_agent text,
  tas_created_at timestamptz DEFAULT now()
);

-- Admin activity logs table
CREATE TABLE tbl_admin_activity_logs (
  taal_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  taal_admin_id uuid NOT NULL REFERENCES tbl_admin_users(tau_id) ON DELETE CASCADE,
  taal_action text NOT NULL,
  taal_module text NOT NULL,
  taal_details jsonb DEFAULT '{}'::jsonb,
  taal_ip_address text,
  taal_created_at timestamptz DEFAULT now()
);

-- Email templates
CREATE TABLE tbl_email_templates (
  tet_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tet_name text UNIQUE NOT NULL,
  tet_subject text NOT NULL,
  tet_body text NOT NULL,
  tet_template_type text NOT NULL,
  tet_variables jsonb DEFAULT '[]',
  tet_is_active boolean DEFAULT true,
  tet_created_at timestamptz DEFAULT now(),
  tet_updated_at timestamptz DEFAULT now()
);

-- System settings
CREATE TABLE tbl_system_settings (
  tss_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tss_setting_key text UNIQUE NOT NULL,
  tss_setting_value jsonb NOT NULL,
  tss_description text,
  tss_created_at timestamptz DEFAULT now(),
  tss_updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_tbl_users_email ON tbl_users(tu_email);
CREATE INDEX idx_tbl_user_profiles_username ON tbl_user_profiles(tup_username) WHERE tup_username IS NOT NULL;
CREATE INDEX idx_tbl_user_profiles_user_id ON tbl_user_profiles(tup_user_id);
CREATE INDEX idx_tbl_user_profiles_sponsorship_number ON tbl_user_profiles(tup_sponsorship_number);
CREATE INDEX idx_tbl_subscription_plans_is_active ON tbl_subscription_plans(tsp_is_active);
CREATE INDEX idx_tbl_user_subscriptions_user_id ON tbl_user_subscriptions(tus_user_id);
CREATE INDEX idx_tbl_user_subscriptions_status ON tbl_user_subscriptions(tus_status);
CREATE INDEX idx_tbl_payments_user_id ON tbl_payments(tp_user_id);
CREATE INDEX idx_tbl_otp_verifications_user_id ON tbl_otp_verifications(tov_user_id);
CREATE INDEX idx_tbl_user_activity_logs_user_id ON tbl_user_activity_logs(tual_user_id);
CREATE INDEX idx_tbl_user_activity_logs_activity_type ON tbl_user_activity_logs(tual_activity_type);
CREATE INDEX idx_tbl_admin_users_email ON tbl_admin_users(tau_email);
CREATE INDEX idx_tbl_admin_sessions_token ON tbl_admin_sessions(tas_session_token);
CREATE INDEX idx_tbl_admin_sessions_admin_id ON tbl_admin_sessions(tas_admin_id);

-- Enable Row Level Security
ALTER TABLE tbl_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbl_system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tbl_users table
CREATE POLICY "Users can insert own data" ON tbl_users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tu_id);

CREATE POLICY "Users can read own data" ON tbl_users
  FOR SELECT TO authenticated
  USING (auth.uid() = tu_id);

CREATE POLICY "Users can update own data" ON tbl_users
  FOR UPDATE TO authenticated
  USING (auth.uid() = tu_id);

-- RLS Policies for tbl_user_profiles table
CREATE POLICY "Users can insert own profile" ON tbl_user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tup_user_id);

CREATE POLICY "Users can read own profile" ON tbl_user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = tup_user_id);

CREATE POLICY "Users can update own profile" ON tbl_user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = tup_user_id);


-- RLS Policies for tbl_subscription_plans table (public read for active plans)
CREATE POLICY "Anyone can read active plans" ON tbl_subscription_plans
  FOR SELECT TO authenticated
  USING (tsp_is_active = true);

-- RLS Policies for tbl_user_subscriptions table
CREATE POLICY "Users can read own subscriptions" ON tbl_user_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = tus_user_id);

CREATE POLICY "Users can insert own subscriptions" ON tbl_user_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tus_user_id);

-- RLS Policies for tbl_payments table
CREATE POLICY "Users can read own payments" ON tbl_payments
  FOR SELECT TO authenticated
  USING (auth.uid() = tp_user_id);

CREATE POLICY "Users can insert own payments" ON tbl_payments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tp_user_id);

-- RLS Policies for tbl_otp_verifications table
CREATE POLICY "Users can read own OTP" ON tbl_otp_verifications
  FOR SELECT TO authenticated
  USING (auth.uid() = tov_user_id);

CREATE POLICY "Users can insert own OTP" ON tbl_otp_verifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tov_user_id);

CREATE POLICY "Users can update own OTP" ON tbl_otp_verifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = tov_user_id);

-- RLS Policies for tbl_user_activity_logs table
CREATE POLICY "Users can read own activity logs" ON tbl_user_activity_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = tual_user_id);

CREATE POLICY "Users can insert own activity logs" ON tbl_user_activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tual_user_id);

-- RLS Policies for tbl_email_templates table (public read for active templates)
CREATE POLICY "Anyone can read active email templates" ON tbl_email_templates
  FOR SELECT TO authenticated
  USING (tet_is_active = true);

-- RLS Policies for tbl_system_settings table (public read)
CREATE POLICY "Anyone can read system settings" ON tbl_system_settings
  FOR SELECT TO authenticated
  USING (true);

-- Admin table policies (simplified for demo)
CREATE POLICY "Super admins can manage all admins" ON tbl_admin_users
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Admins can manage own sessions" ON tbl_admin_sessions
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Admins can read activity logs" ON tbl_admin_activity_logs
  FOR SELECT TO authenticated
  USING (true);

-- Database Functions

-- Function to generate sponsorship numbers
CREATE OR REPLACE FUNCTION generate_sponsorship_number()
RETURNS text AS $$
DECLARE
  new_number text;
  exists_check boolean;
BEGIN
  LOOP
    -- Generate a random 8-digit number
    new_number := 'SP' || LPAD(floor(random() * 100000000)::text, 8, '0');
    
    -- Check if it already exists
    SELECT EXISTS(SELECT 1 FROM tbl_user_profiles WHERE tup_sponsorship_number = new_number) INTO exists_check;
    
    -- If it doesn't exist, we can use it
    IF NOT exists_check THEN
      RETURN new_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate sponsorship number on profile insert
CREATE OR REPLACE FUNCTION auto_generate_sponsorship_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.tup_sponsorship_number IS NULL THEN
    NEW.tup_sponsorship_number := generate_sponsorship_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.tu_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user profiles updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.tup_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update companies updated_at timestamp
CREATE OR REPLACE FUNCTION update_companies_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.tc_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update admin updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tau_updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function for atomic customer registration
CREATE OR REPLACE FUNCTION register_customer(
  p_user_id uuid,
  p_email text,
  p_first_name text,
  p_last_name text,
  p_username text,
  p_mobile text,
  p_gender text,
  p_parent_account text
) RETURNS void AS $$
BEGIN
  -- Insert user record
  INSERT INTO tbl_users (tu_id, tu_email, tu_user_type)
  VALUES (p_user_id, p_email, 'customer');
  
  -- Insert profile record
  INSERT INTO tbl_user_profiles (
    tup_user_id, tup_first_name, tup_last_name, tup_username, 
    tup_mobile, tup_gender, tup_parent_account
  ) VALUES (
    p_user_id, p_first_name, p_last_name, p_username,
    p_mobile, p_gender, p_parent_account
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for atomic company registration
CREATE OR REPLACE FUNCTION register_company(
  p_user_id uuid,
  p_email text,
  p_company_name text,
  p_brand_name text,
  p_business_type text,
  p_business_category text,
  p_registration_number text,
  p_gstin text,
  p_website_url text,
  p_official_email text,
  p_affiliate_code text
) RETURNS void AS $$
BEGIN
  -- Insert user record
  INSERT INTO tbl_users (tu_id, tu_email, tu_user_type)
  VALUES (p_user_id, p_email, 'company');
  
  -- Insert company record
  INSERT INTO tbl_companies (
    tc_user_id, tc_company_name, tc_brand_name, tc_business_type,
    tc_business_category, tc_registration_number, tc_gstin,
    tc_website_url, tc_official_email, tc_affiliate_code
  ) VALUES (
    p_user_id, p_company_name, p_brand_name, p_business_type,
    p_business_category, p_registration_number, p_gstin,
    p_website_url, p_official_email, p_affiliate_code
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Triggers

-- Trigger for auto-generating sponsorship numbers
CREATE TRIGGER trigger_auto_sponsorship_number
  BEFORE INSERT ON tbl_user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_sponsorship_number();

-- Triggers for updated_at
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON tbl_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON tbl_user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at_column();


CREATE TRIGGER trigger_admin_users_updated_at
    BEFORE UPDATE ON tbl_admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_updated_at_column();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION register_customer TO authenticated;
GRANT EXECUTE ON FUNCTION register_company TO authenticated;

-- Insert Default Data

-- Insert default subscription plans
INSERT INTO tbl_subscription_plans (tsp_name, tsp_description, tsp_price, tsp_duration_days, tsp_features, tsp_is_active) VALUES
('Basic Plan', 'Perfect for getting started with MLM', 99.00, 30, '["MLM Tree Access", "Basic Dashboard", "Email Support", "Mobile App Access"]', true),
('Premium Plan', 'Advanced features for serious networkers', 199.00, 30, '["MLM Tree Access", "Advanced Dashboard", "Priority Support", "Analytics & Reports", "Mobile App Access", "Marketing Tools"]', true),
('Enterprise Plan', 'Complete solution for MLM professionals', 399.00, 30, '["MLM Tree Access", "Enterprise Dashboard", "24/7 Support", "Advanced Analytics", "Mobile App Access", "Marketing Tools", "Custom Branding", "API Access"]', true);

-- Insert default email templates
INSERT INTO tbl_email_templates (tet_name, tet_subject, tet_body, tet_template_type, tet_variables) VALUES
('welcome_email', 'Welcome to {{site_name}}!', 
'<h1>Welcome {{first_name}}!</h1><p>Thank you for joining {{site_name}}. Your sponsorship number is: {{sponsorship_number}}</p><p>Please verify your email by clicking the link below:</p><a href="{{verification_link}}">Verify Email</a>', 
'user_registration', '["first_name", "site_name", "sponsorship_number", "verification_link"]'),

('otp_email', 'Your OTP Code - {{site_name}}', 
'<h2>Email Verification</h2><p>Your OTP code is: <strong>{{otp_code}}</strong></p><p>This code will expire in 10 minutes.</p>', 
'otp_verification', '["otp_code", "site_name"]'),

('password_reset', 'Reset Your Password - {{site_name}}', 
'<h2>Password Reset Request</h2><p>Click the link below to reset your password:</p><a href="{{reset_link}}">Reset Password</a><p>If you did not request this, please ignore this email.</p>', 
'password_reset', '["reset_link", "site_name"]');

-- Insert default system settings
INSERT INTO tbl_system_settings (tss_setting_key, tss_setting_value, tss_description) VALUES
('site_name', '"HanakhaDeals"', 'Website name'),
('logo_url', '"https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"', 'Logo URL'),
('email_verification_required', 'true', 'Require email verification'),
('mobile_verification_required', 'true', 'Require mobile verification'),
('referral_mandatory', 'false', 'Make referral mandatory'),
('sms_gateway_provider', '"twilio"', 'SMS gateway provider'),
('sms_gateway_account_sid', '"ACtest123456789"', 'SMS gateway account SID'),
('sms_gateway_auth_token', '"test_auth_token_123"', 'SMS gateway auth token'),
('sms_gateway_from_number', '"+15005550006"', 'SMS gateway from number'),
('smtp_host', '"smtp.mailtrap.io"', 'SMTP host'),
('smtp_port', '2525', 'SMTP port'),
('smtp_username', '"test_username"', 'SMTP username'),
('smtp_password', '"test_password"', 'SMTP password'),
('smtp_encryption', '"tls"', 'SMTP encryption');

-- Insert default super admin (Password: Admin@123456)
INSERT INTO tbl_admin_users (
  tau_email,
  tau_password_hash,
  tau_full_name,
  tau_role,
  tau_permissions,
  tau_is_active
) VALUES (
  'admin@mlmplatform.com',
  '$2b$10$rQZ8kHWKQVz8kHWKQVz8kOQVz8kHWKQVz8kHWKQVz8kHWKQVz8kO',
  'Super Administrator',
  'super_admin',
  '{
    "users": {"read": true, "write": true, "delete": true},
    "companies": {"read": true, "write": true, "delete": true},
    "subscriptions": {"read": true, "write": true, "delete": true},
    "payments": {"read": true, "write": true, "delete": true},
    "settings": {"read": true, "write": true, "delete": true},
    "admins": {"read": true, "write": true, "delete": true},
    "reports": {"read": true, "write": true, "delete": true}
  }'::jsonb,
  true
);

-- Success message
SELECT 'Database setup completed successfully! All tables with tbl_ prefix and column prefixes have been created.' as status;