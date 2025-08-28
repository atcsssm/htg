import React, { useState } from 'react';
import { Shield, CheckCircle } from 'lucide-react';

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  siteKey?: string;
}

const ReCaptcha: React.FC<ReCaptchaProps> = ({ onVerify, siteKey }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock verification for development environment
  const handleMockVerification = async () => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const token = `mock-recaptcha-token-${Date.now()}`;
    setIsVerified(true);
    setIsLoading(false);
    onVerify(token);
  };

  const handleReset = () => {
    setIsVerified(false);
    onVerify(null);
  };

  return (
    <div className="flex justify-center">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 w-full max-w-sm">
        {!isVerified ? (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Shield className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Security Verification</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Click to verify you're not a robot
            </p>
            <button
              type="button"
              onClick={handleMockVerification}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  <span>I'm not a robot</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Verified</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Security verification completed
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Reset verification
            </button>
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            Development Mode - Mock reCAPTCHA
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReCaptcha;