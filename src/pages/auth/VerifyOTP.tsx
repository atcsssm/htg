import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Smartphone, RefreshCw, Mail } from 'lucide-react';

const VerifyOTP: React.FC = () => {
  const { user, verifyOTP, sendOTPToUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpType, setOtpType] = useState<'email' | 'mobile'>('mobile');
  const [contactInfo, setContactInfo] = useState('');

  useEffect(() => {
    // Set contact info based on user data
    if (user) {
      if (otpType === 'email') {
        setContactInfo(user.email);
      } else {
        // For mobile, we'll need to get it from user profile or use a default
        setContactInfo('+1234567890'); // This should come from user profile
      }
    }

    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  useEffect(() => {
    // Send initial OTP when component mounts
    if (user && contactInfo) {
      handleSendOTP();
    }
  }, [user, contactInfo]);
  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('🔍 Submitting OTP verification:', otpString)
      await verifyOTP(otpString);
      console.log('✅ OTP verification successful, redirecting...')
      navigate('/subscription-plans');
    } catch (err) {
      console.error('❌ OTP verification failed:', err)
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOTP = async () => {
    if (!user || !contactInfo) return;
    
    try {
      await sendOTPToUser(user.id, contactInfo, otpType);
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

  const handleResend = async () => {
    if (!user) {
      setError('User not found. Please try registering again.');
      return;
    }
    
    setResendTimer(30);
    setCanResend(false);
    await handleSendOTP();
    console.log('📤 Resending OTP...');
    sendOTP(user.id, user.email, 'mobile')
      .then(() => {
        console.log('✅ OTP resent successfully');
        // Show success message or update UI
      })
      .catch((error) => {
        console.error('❌ Failed to resend OTP:', error);
        setError('Failed to resend OTP. Please try again.');
        setCanResend(true);
        setResendTimer(0);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              otpType === 'mobile' ? 'bg-indigo-100' : 'bg-green-100'
            }`}>
              {otpType === 'mobile' ? (
                <Smartphone className={`h-8 w-8 ${otpType === 'mobile' ? 'text-indigo-600' : 'text-green-600'}`} />
              ) : (
                <Mail className="h-8 w-8 text-green-600" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Verify {otpType === 'mobile' ? 'Mobile Number' : 'Email Address'}
            </h2>
            <p className="mt-2 text-gray-600">
              We've sent a 6-digit verification code to
            </p>
            <p className="font-semibold text-indigo-600">
              {contactInfo}
            </p>
          </div>

          {/* OTP Type Selector */}
          <div className="mb-6">
            <div className="flex space-x-4 justify-center">
              <button
                type="button"
                onClick={() => setOtpType('mobile')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  otpType === 'mobile'
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>Mobile</span>
              </button>
              <button
                type="button"
                onClick={() => setOtpType('email')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  otpType === 'email'
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </button>
            </div>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    maxLength={1}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.join('').length !== 6}
              className={`w-full py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-white ${
                otpType === 'mobile' 
                  ? 'bg-indigo-600 hover:bg-indigo-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify OTP</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Didn't receive the code?
            </p>
            {canResend ? (
              <button
                onClick={handleResend}
                className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-500 font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Resend OTP</span>
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend OTP in {resendTimer} seconds
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;