import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, sendOTP, verifyOTP as verifyOTPAPI, sessionManager, addUserToMLMTree, logUserActivity } from '../lib/supabase';
import { useNotification } from '../components/ui/NotificationProvider';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: 'learner' | 'tutor' | 'job_seeker' | 'job_provider' | 'admin';
  educationLevel?: string;
  interests?: string[];
  isVerified: boolean;
  hasActivePlan: boolean;
  mobileVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: string) => Promise<void>;
  register: (userData: any, userType: string) => Promise<string>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  sendOTPToUser: (userId: string, contactInfo: string, otpType: 'email' | 'mobile') => Promise<any>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const notification = useNotification();

  useEffect(() => {
    // Initialize session from sessionStorage
    const initializeSession = async () => {
      if (isInitialized) return; // Prevent multiple initializations

      setLoading(true);
      try {
        console.log('🔍 Initializing authentication...');

        // First, check if there's an existing Supabase session
        const { data: { session: existingSession } } = await supabase.auth.getSession();

        if (existingSession?.user) {
          console.log('✅ Found existing Supabase session:', existingSession.user.id);
          // Save to sessionStorage if not already saved
          sessionManager.saveSession(existingSession);
          await fetchUserData(existingSession.user.id);
        } else {
          // Try to restore from sessionStorage
          console.log('🔍 Checking sessionStorage for saved session...');
          const restoredSession = await sessionManager.restoreSession();

          if (restoredSession?.user) {
            console.log('✅ Session restored from sessionStorage:', restoredSession.user.id);
            await fetchUserData(restoredSession.user.id);
          } else {
            console.log('ℹ️ No existing session found');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('❌ Failed to initialize session:', error);
        // Clear any corrupted session data
        sessionManager.removeSession();
        setUser(null);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isInitialized) return; // Don't process auth changes until initialized

      console.log('🔄 Auth state change:', event, session?.user?.id);

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in, saving session');
          sessionManager.saveSession(session);
          await fetchUserData(session.user.id);
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('👋 User signed out, clearing session');
          const currentUserId = user?.id;
          sessionManager.removeSession(currentUserId);
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed, updating session');
          sessionManager.saveSession(session);
          // Optionally refresh user data if needed
          if (!user || user.id !== session.user.id) {
            await fetchUserData(session.user.id);
          }
        }
      } catch (error) {
        console.error('❌ Error handling auth state change:', error);
        // Don't clear session on auth state change errors unless it's a sign out
        if (event === 'SIGNED_OUT') {
          sessionManager.removeSession();
          setUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized, user?.id]);

  const fetchUserData = async (userId: string) => {
    if (!userId) {
      console.warn('⚠️ No userId provided to fetchUserData');
      return;
    }

    try {
      console.log('🔍 Fetching user data for:', userId);

      // Try to get user data, but handle RLS gracefully
      let userData = null;
      try {
        const { data: userDataArray, error: userError } = await supabase
            .from('tbl_users')
            .select('*')
            .eq('tu_id', userId);

        if (userError) {
          console.log('⚠️ RLS blocking users table access:', userError.message);
        } else if (userDataArray && userDataArray.length > 0) {
          userData = userDataArray[0];
        }
      } catch (rlsError) {
        console.warn('RLS blocking users table:', rlsError);
      }

      // Try to get profile data
      let profileData = null;
      try {
        const { data: profileDataArray } = await supabase
            .from('tbl_user_profiles')
            .select('*')
            .eq('tup_user_id', userId);
        console.log('📋 Profile data retrieved:', profileDataArray?.length || 0, 'records');
        profileData = profileDataArray?.[0];
      } catch (profileRlsError) {
        console.warn('RLS blocking user_profiles table:', profileRlsError);
      }

      // Try to get company data if user is a company
      let tutorData = null;
      if (userData?.tu_user_type === 'tutor') {
        try {
          const { data: tutorDataArray } = await supabase
              .from('tbl_tutors')
              .select('*')
              .eq('tt_user_id', userId);
          console.log('👨‍🏫 Tutor data retrieved:', tutorDataArray?.length || 0, 'records');
          tutorData = tutorDataArray?.[0];
        } catch (tutorRlsError) {
          console.warn('RLS blocking tutors table:', tutorRlsError);
        }
      }

      // Try to check for active subscription
      let subscriptionData = null;
      try {
        const { data: subscriptionDataArray } = await supabase
            .from('tbl_user_subscriptions')
            .select('*')
            .eq('tus_user_id', userId)
            .eq('tus_status', 'active')
            .gte('tus_end_date', new Date().toISOString());
        console.log('💳 Subscription data retrieved:', subscriptionDataArray?.length || 0, 'records');
        subscriptionData = subscriptionDataArray?.[0];
      } catch (subscriptionRlsError) {
        console.warn('RLS blocking user_subscriptions table:', subscriptionRlsError);
      }

      // Get current session to get email
      const { data: { session } } = await supabase.auth.getSession();

      const user: User = {
        id: userId,
        email: session?.user?.email || userData?.tu_email || 'unknown@example.com',
        firstName: profileData?.tup_first_name,
        lastName: profileData?.tup_last_name,
        userType: userData?.tu_user_type || 'learner',
        educationLevel: profileData?.tup_education_level,
        interests: profileData?.tup_interests,
        isVerified: userData?.tu_is_verified || false,
        hasActivePlan: true, // Set to true for demo mode
        mobileVerified: userData?.tu_mobile_verified || false
      };

      console.log('✅ User data compiled:', user);
      setUser(user);
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      // Don't throw error, just set user to null
      setUser(null);
    }
  };

  const login = async (emailOrUsername: string, password: string, userType: string) => {
    setLoading(true);
    try {
      console.log('🔍 Attempting login for:', emailOrUsername);

      // Clear any existing session data first
      console.log('🧹 Clearing existing session data...');
      sessionManager.removeSession();
      await supabase.auth.signOut();
      setUser(null);

      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Determine if input is email or username
      const isEmail = emailOrUsername.includes('@');
      let actualEmail = emailOrUsername;

      // If username provided, get the email from user_profiles
      if (!isEmail) {
        const { data: profileData, error: profileError } = await supabase
            .from('tbl_user_profiles')
            .select('tup_user_id, tbl_users!inner(tu_email)')
            .eq('tup_username', emailOrUsername)
            .single();

        if (profileError || !profileData) {
          throw new Error('Username not found');
        }
        actualEmail = profileData.tbl_users.tu_email;
      }

      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: actualEmail,
        password: password
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user || !authData.session) {
        throw new Error('Authentication failed - no session created');
      }

      // Explicitly save the session
      console.log('💾 Saving session after login...');
      sessionManager.saveSession(authData.session);

      // Log login activity
      try {
        await logUserActivity(authData.user.id, 'login');
      } catch (logError) {
        console.warn('Failed to log login activity:', logError);
      }

      // Fetch user data explicitly
      await fetchUserData(authData.user.id);

      notification.showSuccess('Login Successful!', 'Welcome back!');

      // Navigate based on user type
      if (user?.userType) {
        switch (user.userType) {
          case 'learner':
            navigate('/learner/dashboard');
            break;
          case 'tutor':
            navigate('/tutor/dashboard');
            break;
          case 'job_seeker':
            navigate('/job-seeker/dashboard');
            break;
          case 'job_provider':
            navigate('/job-provider/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage = error?.message || 'Login failed';
      notification.showError('Login Failed', errorMessage);

      // Clear any partial session data on error
      sessionManager.removeSession();
      setUser(null);

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any, userType: string) => {
    setLoading(true);
    try {
      console.log('🔍 Attempting registration for:', userData.email);

      // Clear any existing session data first
      sessionManager.removeSession();
      await supabase.auth.signOut();

      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined // Disable email confirmation for demo
        }
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        console.error('No user data returned from Supabase');
        throw new Error('Registration failed');
      }

      console.log('✅ Supabase auth successful, user ID:', authData.user.id);

      // Save session immediately if available
      if (authData.session) {
        console.log('💾 Saving session to sessionStorage');
        sessionManager.saveSession(authData.session);
      }

      // Use unified registration function
      console.log('📝 Registering user profile...');
      const { data: regResult, error: regError } = await supabase.rpc('register_user', {
        p_user_id: authData.user.id,
        p_email: userData.email,
        p_first_name: userData.firstName,
        p_middle_name: userData.middleName || '',
        p_last_name: userData.lastName,
        p_username: userData.userName,
        p_mobile: userData.phoneNumber || userData.mobile || '',
        p_user_type: userType
      });

      if (regError) {
        console.error('User registration error:', regError);
        throw new Error(regError.message);
      }

      // Check if the function returned an error
      if (regResult && !regResult.success) {
        console.error('Registration function returned error:', regResult);
        throw new Error(regResult.error || 'Registration failed');
      }

      console.log('✅ Registration function result:', regResult);

      // Log registration activity
      try {
        await logUserActivity(authData.user.id, 'registration');
      } catch (logError) {
        console.warn('Failed to log registration activity:', logError);
      }

      console.log('✅ Registration completed successfully:', regResult);
      notification.showSuccess('Registration Successful!', 'Your account has been created successfully.');

      // Fetch user data immediately after successful registration
      if (authData.session) {
        await fetchUserData(authData.user.id);
      }

      return authData.user.id;

    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      const errorMessage = error?.message || 'Registration failed';
      notification.showError('Registration Failed', errorMessage);

      // Clear any partial session data on error
      sessionManager.removeSession();
      setUser(null);

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    const currentUserId = user?.id;

    try {
      // Log logout activity before signing out
      if (user) {
        try {
          await logUserActivity(user.id, 'logout');
        } catch (logError) {
          console.warn('Failed to log logout activity:', logError);
        }
      }

      // Clear all session data
      console.log('🧹 Clearing all session data during logout...');
      sessionManager.removeSession(currentUserId);

      // Sign out from Supabase
      supabase.auth.signOut();

      // Clear user state
      setUser(null);

      notification.showInfo('Logged Out', 'You have been successfully logged out.');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }

      notification.showSuccess('Reset Email Sent', 'Please check your email for password reset instructions.');
    } catch (error: any) {
      notification.showError('Reset Failed', error?.message || 'Failed to send reset email');
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw new Error(error.message);
      }

      notification.showSuccess('Password Reset', 'Your password has been updated successfully.');
    } catch (error: any) {
      notification.showError('Reset Failed', error?.message || 'Failed to reset password');
      throw error;
    }
  };

  const verifyOTP = async (otp: string) => {
    try {
      if (!user) {
        throw new Error('No user found');
      }

      console.log('🔍 Starting OTP verification for user:', user.id);
      const result = await verifyOTPAPI(user.id, otp, 'mobile');

      if (!result.success) {
        throw new Error(result.error || 'OTP verification failed');
      }

      console.log('✅ OTP verification successful');
      setUser({ ...user, mobileVerified: true });
      notification.showSuccess('Verification Successful', 'Mobile number verified successfully.');
    } catch (error: any) {
      console.error('❌ OTP verification failed:', error);
      notification.showError('Verification Failed', error?.message || 'Invalid OTP code');
      throw error;
    }
  };

  const sendOTPToUser = async (userId: string, contactInfo: string, otpType: 'email' | 'mobile') => {
    try {
      console.log('📤 Sending OTP to user:', { userId, contactInfo, otpType });
      const result = await sendOTP(userId, contactInfo, otpType);

      if (!result.success) {
        throw new Error(result.error || 'Failed to send OTP');
      }

      console.log('✅ OTP sent successfully');
      notification.showSuccess('OTP Sent', `Verification code sent to ${contactInfo}`);
      return result;
    } catch (error: any) {
      console.error('❌ Failed to send OTP:', error);
      notification.showError('Send Failed', error?.message || 'Failed to send OTP');
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyOTP,
    sendOTPToUser,
    loading
  };

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
};