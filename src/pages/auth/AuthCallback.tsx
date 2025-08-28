import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../components/ui/NotificationProvider';
import { Shield, Loader } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const notification = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        if (type === 'recovery' && token) {
          // This is a password reset callback
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          });
          
          if (error) {
            throw error;
          }
          
          if (data.session) {
            // User is now authenticated, redirect to reset password page
            notification.showSuccess('Email Verified', 'You can now reset your password.');
            navigate('/reset-password');
          } else {
            throw new Error('Failed to verify reset token');
          }
        } else {
          // Handle other auth callbacks or redirect to home
          navigate('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError(error.message || 'Authentication failed');
        notification.showError('Authentication Failed', 'The reset link is invalid or has expired.');
        
        // Redirect to forgot password page after 3 seconds
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, notification]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying...</h2>
            <p className="text-gray-600">Please wait while we verify your reset link.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <p className="text-sm text-gray-500">You will be redirected to the forgot password page shortly.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;