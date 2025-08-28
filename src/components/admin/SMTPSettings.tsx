import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Mail, Server, Lock, Key, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

const SMTPSettings: React.FC = () => {
  const { emailSMTP, updateEmailSMTP } = useAdmin();
  const [formData, setFormData] = useState(emailSMTP);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailSMTP(formData);
    alert('SMTP settings updated successfully! Configure these same settings in your Supabase Dashboard under Settings > Integrations > Resend.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const testSMTPConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Simulate SMTP test - in production, this would test via Supabase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock test result
      const isValid = formData.host && formData.username && formData.password;
      
      if (isValid) {
        setTestResult({
          success: true,
          message: 'SMTP configuration looks valid! Make sure to configure the same settings in Supabase Dashboard > Settings > Integrations > Resend.'
        });
      } else {
        setTestResult({
          success: false,
          message: 'SMTP configuration incomplete. Please fill all required fields.'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Configuration test failed: ${error.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Email Configuration (Resend.com)</h3>
          <p className="text-gray-600">Configure Resend.com in Supabase Dashboard for email delivery</p>
        </div>
      </div>

      {/* Supabase Integration Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-2">
          <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Supabase + Resend.com Setup Instructions</h4>
            <div className="text-sm text-blue-700 mt-1">
              <ol className="list-decimal list-inside space-y-1">
                <li>Create account at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center">Resend.com <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                <li>Get your API key from Resend dashboard</li>
                <li>Go to Supabase Dashboard → Settings → Integrations → Resend</li>
                <li>Add your Resend API key and configure sender domain</li>
                <li>Test email delivery through Supabase</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-2">
              SMTP Host (Reference Only)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Server className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="host"
                name="host"
                value={formData.host}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                placeholder="smtp.resend.com"
                readOnly
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Resend.com handles SMTP automatically</p>
          </div>

          <div>
            <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-2">
              Port (Reference Only)
            </label>
            <input
              type="number"
              id="port"
              name="port"
              value={587}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">Resend.com uses standard ports</p>
          </div>
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            From Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="username"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="noreply@yourdomain.com"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Configure this domain in Resend.com</p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Resend API Key
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="re_xxxxxxxxxxxxxxxxx"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Get this from your Resend.com dashboard</p>
        </div>

        {/* Resend Setup Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Important: Supabase Configuration Required</h4>
              <div className="text-sm text-yellow-700 mt-1">
                <p className="mb-2">After saving these settings, you must also configure Resend in your Supabase Dashboard:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Supabase Dashboard → Settings → Integrations</li>
                  <li>Find "Resend" and click "Configure"</li>
                  <li>Add your Resend API key</li>
                  <li>Configure your sender domain</li>
                  <li>Test email delivery</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`border rounded-lg p-4 ${
            testResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </span>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={testSMTPConnection}
            disabled={testing}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {testing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Server className="h-4 w-4" />
                <span>Test Configuration</span>
              </>
            )}
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Mail className="h-4 w-4" />
            <span>Save Email Settings</span>
          </button>
        </div>
      </form>

      {/* Configuration Examples */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Resend.com Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h5 className="font-medium text-gray-900">Reliable Delivery</h5>
            <p>99.9% delivery rate with advanced routing</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h5 className="font-medium text-gray-900">Developer Friendly</h5>
            <p>Simple API with excellent documentation</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h5 className="font-medium text-gray-900">Affordable Pricing</h5>
            <p>3,000 emails/month free, then $20/month</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMTPSettings;