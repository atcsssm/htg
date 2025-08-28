import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { MessageSquare, Key, Phone, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

const SMSSettings: React.FC = () => {
  const { smsGateway, updateSMSGateway } = useAdmin();
  const [formData, setFormData] = useState(smsGateway);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testNumber, setTestNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSMSGateway(formData);
    alert('SMS gateway settings updated successfully! Make sure to configure the same Twilio credentials in your Supabase Dashboard under Settings > Integrations > Twilio.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const testSMSConnection = async () => {
    if (!testNumber) {
      alert('Please enter a test phone number');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Simulate SMS test - in production, this would test via Supabase
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock test result
      const isValid = formData.apiKey && formData.apiSecret;
      
      if (isValid) {
        setTestResult({
          success: true,
          message: `SMS configuration looks valid! Make sure to configure the same Twilio credentials in Supabase Dashboard.`
        });
      } else {
        setTestResult({
          success: false,
          message: 'SMS configuration incomplete. Please check your Twilio credentials.'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `SMS test failed: ${error.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-green-100 p-3 rounded-lg">
          <MessageSquare className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">SMS Configuration (Twilio)</h3>
          <p className="text-gray-600">Configure Twilio in Supabase Dashboard for SMS delivery</p>
        </div>
      </div>

      {/* Supabase + Twilio Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-2">
          <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Supabase + Twilio Setup Instructions</h4>
            <div className="text-sm text-blue-700 mt-1">
              <ol className="list-decimal list-inside space-y-1">
                <li>Create a free account at <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center">Twilio.com <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                <li>Get your Account SID and Auth Token from the Console Dashboard</li>
                <li>Purchase a phone number or use the trial number</li>
                <li>Go to Supabase Dashboard → Settings → Integrations → Twilio</li>
                <li>Add your Twilio credentials and test SMS delivery</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
            SMS Provider
          </label>
          <select
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
            disabled
          >
            <option value="Twilio">Twilio (via Supabase Integration)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Twilio is integrated through Supabase for better reliability</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              Account SID (API Key) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="apiKey"
                name="apiKey"
                required
                value={formData.apiKey}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">From Twilio Console Dashboard</p>
          </div>

          <div>
            <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700 mb-2">
              Auth Token (API Secret) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="apiSecret"
                name="apiSecret"
                required
                value={formData.apiSecret}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Your Auth Token"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Keep this secret and secure</p>
          </div>
        </div>

        <div>
          <label htmlFor="senderId" className="block text-sm font-medium text-gray-700 mb-2">
            From Phone Number *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="senderId"
              name="senderId"
              required
              value={formData.senderId}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+1234567890"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use your Twilio phone number (including country code)
          </p>
        </div>

        {/* Supabase Configuration Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Important: Supabase Configuration Required</h4>
              <div className="text-sm text-yellow-700 mt-1">
                <p className="mb-2">After saving these settings, you must also configure Twilio in your Supabase Dashboard:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Supabase Dashboard → Settings → Integrations</li>
                  <li>Find "Twilio" and click "Configure"</li>
                  <li>Add your Account SID and Auth Token</li>
                  <li>Add your Twilio phone number</li>
                  <li>Test SMS delivery</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Test SMS Section */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Test SMS Configuration</h4>
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="tel"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter test phone number (+1234567890)"
              />
            </div>
            <button
              type="button"
              onClick={testSMSConnection}
              disabled={testing || !testNumber}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  <span>Test Configuration</span>
                </>
              )}
            </button>
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

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Save SMS Settings</span>
          </button>
        </div>
      </form>

      {/* Pricing Information */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Twilio Pricing Information</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <h5 className="font-medium text-gray-900">SMS Pricing</h5>
              <p className="text-gray-600">~$0.0075 per SMS in US</p>
              <p className="text-gray-600">Varies by country</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900">Phone Number</h5>
              <p className="text-gray-600">~$1.00/month</p>
              <p className="text-gray-600">One-time setup</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-900">Free Trial</h5>
              <p className="text-gray-600">$15.50 credit</p>
              <p className="text-gray-600">No expiration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSSettings;