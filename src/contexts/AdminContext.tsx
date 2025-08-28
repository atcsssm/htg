import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';

interface GeneralSettings {
  siteName: string;
  logoUrl: string;
  dateFormat: string;
  timezone: string;
  emailVerificationRequired: boolean;
  mobileVerificationRequired: boolean;
  autoTutorAssignment: boolean;
  maxStudentsPerTutor: number;
  jobSeekerVideoUrl: string;
  jobProviderVideoUrl: string;
}

interface SMSGateway {
  provider: string;
  apiKey: string;
  apiSecret: string;
  senderId: string;
}

interface EmailSMTP {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: string;
}

interface SubscriptionPlan {
  id: string;
  tsp_name: string;
  price: number;
  tsp_duration_days: number;
  tsp_features: string[];
  tsp_is_active: boolean;
}

interface AdminContextType {
  settings: GeneralSettings;
  smsGateway: SMSGateway;
  emailSMTP: EmailSMTP;
  subscriptionPlans: SubscriptionPlan[];
  updateSettings: (settings: Partial<GeneralSettings>) => void;
  updateSMSGateway: (gateway: SMSGateway) => void;
  updateEmailSMTP: (smtp: EmailSMTP) => void;
  updateSubscriptionPlans: (plans: SubscriptionPlan[]) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GeneralSettings>({
    siteName: 'HTG Infotech',
    logoUrl: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'UTC',
    emailVerificationRequired: true,
    mobileVerificationRequired: true,
    autoTutorAssignment: true,
    maxStudentsPerTutor: 20,
    jobSeekerVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    jobProviderVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  });

  const [smsGateway, setSMSGateway] = useState<SMSGateway>({
    provider: 'Twilio (via Supabase)',
    apiKey: '',
    apiSecret: '',
    senderId: 'MLM-PLATFORM'
  });

  const [emailSMTP, setEmailSMTP] = useState<EmailSMTP>({
    host: 'Resend.com (via Supabase)',
    port: 587,
    username: '',
    password: '',
    encryption: 'TLS'
  });

  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([
    {
      id: '1',
      tsp_name: 'Basic Learning Plan',
      tsp_price: 99,
      tsp_duration_days: 30,
      tsp_features: ['Free Course Access', 'Basic Dashboard', 'Email Support'],
      tsp_is_active: true
    },
    {
      id: '2',
      tsp_name: 'Premium Learning Plan',
      tsp_price: 199,
      tsp_duration_days: 30,
      tsp_features: ['All Course Access', 'Advanced Dashboard', 'Priority Support', 'Progress Analytics'],
      tsp_is_active: true
    },
    {
      id: '3',
      tsp_name: 'Pro Learning Plan',
      tsp_price: 399,
      tsp_duration_days: 30,
      tsp_features: ['All Course Access', 'Personal Tutor Assignment', '1-on-1 Sessions', 'Advanced Analytics', 'Certificate Generation'],
      tsp_is_active: true
    }
  ]);

  // Load settings from database on initialization
  React.useEffect(() => {
    loadSettingsFromDatabase();
  }, []);

  const loadSettingsFromDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_system_settings')
        .select('tss_setting_key, tss_setting_value');

      if (error) {
        console.warn('Failed to load settings from database, using defaults:', error);
        return;
      }

      const settingsMap = data?.reduce((acc: any, setting: any) => {
        try {
          // Handle both JSON strings and plain strings
          let value = setting.tss_setting_value;
          
          // If the value starts and ends with quotes, it's a JSON string
          if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
            acc[setting.tss_setting_key] = JSON.parse(value);
          } else if (typeof value === 'string') {
            // Try to parse as JSON first, if it fails, use as plain string
            try {
              acc[setting.tss_setting_key] = JSON.parse(value);
            } catch {
              // If JSON parsing fails, use the raw string value
              acc[setting.tss_setting_key] = value;
            }
          } else {
            // For non-string values (boolean, number, etc.)
            acc[setting.tss_setting_key] = value;
          }
        } catch (parseError) {
          console.warn('Failed to parse setting value:', setting.tss_setting_key, parseError);
          // Use the raw value as fallback
          acc[setting.tss_setting_key] = setting.tss_setting_value;
        }
        return acc;
      }, {}) || {};

      // Update settings with database values
      setSettings(prev => ({
        ...prev,
        siteName: settingsMap.site_name || prev.siteName,
        logoUrl: settingsMap.logo_url || prev.logoUrl,
        dateFormat: settingsMap.date_format || prev.dateFormat,
        timezone: settingsMap.timezone || prev.timezone,
        emailVerificationRequired: settingsMap.email_verification_required ?? prev.emailVerificationRequired,
        mobileVerificationRequired: settingsMap.mobile_verification_required ?? prev.mobileVerificationRequired,
        jobSeekerVideoUrl: settingsMap.job_seeker_video_url || prev.jobSeekerVideoUrl,
        jobProviderVideoUrl: settingsMap.job_provider_video_url || prev.jobProviderVideoUrl
      }));

      console.log('✅ Settings loaded from database:', settingsMap);
    } catch (error) {
      console.error('Error loading settings from database:', error);
    }
  };

  const updateSettings = (newSettings: Partial<GeneralSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    // Trigger a re-render by updating the context
  };

  const updateSMSGateway = (gateway: SMSGateway) => {
    setSMSGateway(gateway);
  };

  const updateEmailSMTP = (smtp: EmailSMTP) => {
    setEmailSMTP(smtp);
  };

  const updateSubscriptionPlans = (plans: SubscriptionPlan[]) => {
    setSubscriptionPlans(plans);
  };

  const value = {
    settings,
    smsGateway,
    emailSMTP,
    subscriptionPlans,
    updateSettings,
    updateSMSGateway,
    updateEmailSMTP,
    updateSubscriptionPlans
  };

  return (
      <AdminContext.Provider value={value}>
        {children}
      </AdminContext.Provider>
  );
};