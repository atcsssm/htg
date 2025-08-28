import React, { useState } from 'react';
import { Shield, FileText, Eye, Lock, AlertTriangle, CheckCircle } from 'lucide-react';

const SitePolicies: React.FC = () => {
  const [activeTab, setActiveTab] = useState('terms');

  const tabs = [
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Eye },
    { id: 'security', label: 'Security Policy', icon: Shield },
    { id: 'refund', label: 'Refund Policy', icon: AlertTriangle },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">Legal & Policies</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Site Policies</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Transparent policies that protect your rights and ensure a safe, secure platform experience.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'terms' && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms of Service</h2>
                <p className="text-gray-600 mb-6">Last updated: January 1, 2024</p>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h3>
                    <p className="text-gray-600 mb-4">
                      By accessing and using our MLM platform, you accept and agree to be bound by the terms and provision of this agreement. 
                      If you do not agree to abide by the above, please do not use this service.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">2. User Accounts</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>You must provide accurate and complete information when creating an account</li>
                      <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                      <li>You must notify us immediately of any unauthorized use of your account</li>
                      <li>One person may only maintain one active account</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">3. MLM Participation</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>Participation in our MLM program requires active subscription to one of our plans</li>
                      <li>Earnings are based on your network activity and subscription level</li>
                      <li>We do not guarantee specific income levels or results</li>
                      <li>All promotional activities must comply with applicable laws and regulations</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Prohibited Activities</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>Creating multiple accounts or using false identities</li>
                      <li>Engaging in fraudulent or deceptive practices</li>
                      <li>Spamming or unsolicited marketing communications</li>
                      <li>Attempting to manipulate the compensation system</li>
                      <li>Violating any applicable laws or regulations</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Termination</h3>
                    <p className="text-gray-600 mb-4">
                      We reserve the right to terminate or suspend your account at any time for violations of these terms. 
                      Upon termination, your right to use the service will cease immediately.
                    </p>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Policy</h2>
                <p className="text-gray-600 mb-6">Last updated: January 1, 2024</p>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h3>
                    <div className="bg-blue-50 p-6 rounded-lg mb-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Personal Information</h4>
                      <ul className="list-disc list-inside text-blue-800 space-y-1">
                        <li>Name, email address, phone number</li>
                        <li>Payment and billing information</li>
                        <li>Identity verification documents</li>
                        <li>Profile information and preferences</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Usage Information</h4>
                      <ul className="list-disc list-inside text-green-800 space-y-1">
                        <li>Login activity and session data</li>
                        <li>Platform usage patterns</li>
                        <li>Device and browser information</li>
                        <li>IP address and location data</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>To provide and maintain our services</li>
                      <li>To process payments and manage your account</li>
                      <li>To communicate with you about your account and services</li>
                      <li>To improve our platform and user experience</li>
                      <li>To comply with legal obligations</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Information Sharing</h3>
                    <p className="text-gray-600 mb-4">
                      We do not sell, trade, or otherwise transfer your personal information to third parties except:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>With your explicit consent</li>
                      <li>To trusted service providers who assist in operating our platform</li>
                      <li>When required by law or to protect our rights</li>
                      <li>In connection with a business transfer or merger</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Security</h3>
                    <p className="text-gray-600 mb-4">
                      We implement industry-standard security measures to protect your personal information, including:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>SSL encryption for data transmission</li>
                      <li>Secure data storage with access controls</li>
                      <li>Regular security audits and updates</li>
                      <li>Multi-factor authentication options</li>
                    </ul>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Policy</h2>
                <p className="text-gray-600 mb-6">Our commitment to protecting your data and maintaining platform security.</p>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Measures</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-50 p-6 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <Lock className="h-5 w-5 text-green-600" />
                          <h4 className="font-semibold text-green-900">Data Encryption</h4>
                        </div>
                        <p className="text-green-800 text-sm">All data is encrypted in transit and at rest using industry-standard AES-256 encryption.</p>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <h4 className="font-semibold text-blue-900">Access Controls</h4>
                        </div>
                        <p className="text-blue-800 text-sm">Multi-layered access controls ensure only authorized personnel can access sensitive data.</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">User Security Best Practices</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>Use strong, unique passwords for your account</li>
                      <li>Enable two-factor authentication when available</li>
                      <li>Keep your contact information up to date</li>
                      <li>Log out from shared or public devices</li>
                      <li>Report suspicious activity immediately</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Incident Response</h3>
                    <p className="text-gray-600 mb-4">
                      In the event of a security incident, we will:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>Immediately investigate and contain the incident</li>
                      <li>Notify affected users within 72 hours</li>
                      <li>Provide regular updates on the investigation</li>
                      <li>Implement additional security measures as needed</li>
                      <li>Cooperate with law enforcement if required</li>
                    </ul>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'refund' && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Policy</h2>
                <p className="text-gray-600 mb-6">Understanding our refund terms and conditions.</p>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Subscription Refunds</h3>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <h4 className="font-semibold text-yellow-900">30-Day Money-Back Guarantee</h4>
                      </div>
                      <p className="text-yellow-800">
                        New subscribers can request a full refund within 30 days of their initial subscription, 
                        provided they have not earned any commissions.
                      </p>
                    </div>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>Refund requests must be submitted within 30 days of purchase</li>
                      <li>Account must not have generated any earnings or commissions</li>
                      <li>Refunds are processed within 5-10 business days</li>
                      <li>Processing fees may be deducted from the refund amount</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Refund Process</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-indigo-600 font-bold">1</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Submit Request</h4>
                        <p className="text-gray-600 text-sm">Contact our support team with your refund request and reason.</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-indigo-600 font-bold">2</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Review Process</h4>
                        <p className="text-gray-600 text-sm">We review your account activity and eligibility for refund.</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-indigo-600 font-bold">3</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Refund Issued</h4>
                        <p className="text-gray-600 text-sm">Approved refunds are processed to your original payment method.</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Non-Refundable Items</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>Subscriptions older than 30 days</li>
                      <li>Accounts that have generated earnings or commissions</li>
                      <li>Processing and transaction fees</li>
                      <li>Accounts terminated for policy violations</li>
                    </ul>
                  </section>
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Compliance & Legal</h2>
                <p className="text-gray-600 mb-6">Our commitment to legal compliance and regulatory standards.</p>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Regulatory Compliance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-50 p-6 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h4 className="font-semibold text-green-900">FTC Compliance</h4>
                        </div>
                        <p className="text-green-800 text-sm">Full compliance with Federal Trade Commission guidelines for MLM businesses.</p>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <h4 className="font-semibold text-blue-900">Data Protection</h4>
                        </div>
                        <p className="text-blue-800 text-sm">GDPR and CCPA compliant data handling and privacy protection.</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Anti-Money Laundering (AML)</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>Identity verification required for all users</li>
                      <li>Transaction monitoring and reporting systems</li>
                      <li>Compliance with Bank Secrecy Act requirements</li>
                      <li>Regular AML training for staff</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">International Compliance</h3>
                    <p className="text-gray-600 mb-4">
                      We operate in compliance with local laws and regulations in all jurisdictions where our services are available:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                      <li>Regular legal reviews in all operating countries</li>
                      <li>Local business registrations where required</li>
                      <li>Tax compliance and reporting</li>
                      <li>Consumer protection law adherence</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Reporting Violations</h3>
                    <div className="bg-red-50 border-l-4 border-red-400 p-6">
                      <h4 className="font-semibold text-red-900 mb-2">Report Compliance Issues</h4>
                      <p className="text-red-800 mb-3">
                        If you become aware of any potential compliance violations, please report them immediately:
                      </p>
                      <ul className="list-disc list-inside text-red-800 space-y-1">
                        <li>Email: compliance@mlmplatform.com</li>
                        <li>Phone: +1 (555) 123-4567</li>
                        <li>Anonymous reporting portal available</li>
                      </ul>
                    </div>
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SitePolicies;