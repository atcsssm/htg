import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle, Users, CreditCard, Shield, Settings } from 'lucide-react';

const FAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const categories = [
    { id: 'general', label: 'General', icon: HelpCircle },
    { id: 'account', label: 'Account & Registration', icon: Users },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'technical', label: 'Technical Support', icon: Settings }
  ];

  const faqs = {
    general: [
      {
        question: "What is MLM and how does your platform work?",
        answer: "MLM (Multi-Level Marketing) is a business model where you earn money through direct sales and by recruiting others to join your network. Our platform uses a binary tree system where each member can have two direct recruits, creating a balanced and fair compensation structure. You earn commissions from your personal sales and bonuses from your team's performance."
      },
      {
        question: "How much money can I make?",
        answer: "Earnings vary greatly depending on your effort, dedication, and ability to build and maintain a network. We do not guarantee specific income levels. Success in MLM requires consistent work, effective marketing, and strong relationship-building skills. Some members earn modest supplemental income while others build substantial businesses."
      },
      {
        question: "Is this a pyramid scheme?",
        answer: "No, our platform is a legitimate MLM business that focuses on actual product sales and services. Unlike pyramid schemes, we have real products/services, sustainable compensation plans, and comply with all FTC regulations. Members earn money primarily through sales, not just recruitment."
      },
      {
        question: "What countries do you operate in?",
        answer: "We currently operate in over 150 countries worldwide. However, availability may vary based on local regulations. Please check our supported countries list during registration or contact support to confirm availability in your region."
      }
    ],
    account: [
      {
        question: "How do I create an account?",
        answer: "Creating an account is simple: 1) Click 'Join as Customer' or 'Join as Company' on our homepage, 2) Fill out the registration form with accurate information, 3) Verify your email address, 4) Complete identity verification if required, 5) Choose and pay for your subscription plan. You'll then have full access to your dashboard."
      },
      {
        question: "Can I change my sponsor/upline after registration?",
        answer: "No, sponsor relationships cannot be changed after account creation. This maintains the integrity of our binary tree structure and ensures fair compensation distribution. Please carefully choose your sponsor during registration as this decision is permanent."
      },
      {
        question: "What if I forget my password?",
        answer: "Use the 'Forgot Password' link on the login page. Enter your email address and we'll send you a secure reset link. Follow the instructions in the email to create a new password. If you don't receive the email, check your spam folder or contact support."
      },
      {
        question: "How do I update my profile information?",
        answer: "Log into your dashboard and navigate to 'Profile Settings' or 'Account Settings'. You can update most information including contact details, payment methods, and preferences. Some changes may require verification for security purposes."
      }
    ],
    payments: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept major credit cards (Visa, MasterCard, American Express), bank transfers, and cryptocurrency payments through our secure blockchain integration. All payments are processed through encrypted, PCI-compliant systems for maximum security."
      },
      {
        question: "When and how are commissions paid?",
        answer: "Commissions are calculated daily and paid weekly every Friday. Payments are made to your registered payment method (bank account, digital wallet, or cryptocurrency wallet). Minimum payout threshold is $50. You can track all earnings in real-time through your dashboard."
      },
      {
        question: "Are there any fees for withdrawals?",
        answer: "Standard bank transfers have a $2 processing fee. Cryptocurrency withdrawals have network fees that vary by currency. There are no fees for the first withdrawal each month. Premium members enjoy reduced or waived fees on all transactions."
      },
      {
        question: "What is your refund policy?",
        answer: "We offer a 30-day money-back guarantee for new subscribers who haven't earned any commissions. Refund requests must be submitted within 30 days of purchase. Processing fees may be deducted. Refunds are processed within 5-10 business days to your original payment method."
      }
    ],
    security: [
      {
        question: "How secure is my personal information?",
        answer: "We use bank-grade security including SSL encryption, secure data centers, and regular security audits. Your personal information is never sold to third parties. We comply with GDPR, CCPA, and other privacy regulations. All staff undergo security training and background checks."
      },
      {
        question: "Do you offer two-factor authentication?",
        answer: "Yes, we strongly recommend enabling two-factor authentication (2FA) for enhanced account security. You can set up 2FA using SMS, email, or authenticator apps like Google Authenticator. This adds an extra layer of protection to your account."
      },
      {
        question: "What should I do if I suspect unauthorized access?",
        answer: "Immediately change your password and contact our security team at security@mlmplatform.com. We'll investigate the issue, secure your account, and provide guidance on additional security measures. Monitor your account activity regularly and report any suspicious transactions."
      },
      {
        question: "How do you protect against fraud?",
        answer: "We employ advanced fraud detection systems, identity verification processes, and continuous monitoring. Suspicious activities trigger automatic alerts and account reviews. We also educate members about common scams and provide reporting mechanisms for fraudulent activities."
      }
    ],
    technical: [
      {
        question: "What browsers are supported?",
        answer: "Our platform works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for optimal performance and security. Mobile browsers are also fully supported for on-the-go access."
      },
      {
        question: "Is there a mobile app available?",
        answer: "Currently, we offer a mobile-responsive website that works excellently on all devices. A dedicated mobile app is in development and will be available soon. You can add our website to your home screen for app-like functionality."
      },
      {
        question: "Why is my dashboard loading slowly?",
        answer: "Slow loading can be caused by internet connection, browser cache, or high server traffic. Try clearing your browser cache, checking your internet connection, or accessing during off-peak hours. Contact technical support if problems persist."
      },
      {
        question: "How do I report a technical bug?",
        answer: "Report bugs through our support portal or email tech-support@mlmplatform.com. Include details about your browser, device, steps to reproduce the issue, and any error messages. Screenshots are helpful. We prioritize bug fixes based on severity and user impact."
      }
    ]
  };

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFaqs = faqs[activeCategory as keyof typeof faqs].filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
            <HelpCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Help Center</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto mb-8">
            Find quick answers to common questions about our MLM platform.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 border border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                placeholder="Search for answers..."
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <category.icon className="h-5 w-5" />
                    <span className="font-medium">{category.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {categories.find(cat => cat.id === activeCategory)?.label}
                </h2>
                <p className="text-gray-600 mt-2">
                  {filteredFaqs.length} question{filteredFaqs.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="p-6">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600">Try adjusting your search terms or browse different categories.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFaqs.map((faq, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleItem(index)}
                          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                        >
                          <h3 className="text-lg font-medium text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          {openItems.includes(index) ? (
                            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        {openItems.includes(index) && (
                          <div className="px-6 pb-6">
                            <div className="prose prose-gray max-w-none">
                              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
              <p className="text-indigo-100 mb-6">
                Our support team is here to help you succeed. Get personalized assistance from our experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="mailto:support@mlmplatform.com"
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;