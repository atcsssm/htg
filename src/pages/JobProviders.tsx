import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { Building, Users, TrendingUp, Award, CheckCircle, Target } from 'lucide-react';

const JobProviders: React.FC = () => {
  const { settings } = useAdmin();
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    // Get video URL from admin settings
    setVideoUrl(settings.jobProviderVideoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ');
  }, [settings]);

  const benefits = [
    {
      icon: Users,
      title: "Access Top Talent",
      description: "Connect with qualified candidates from our extensive database of job seekers."
    },
    {
      icon: Target,
      title: "Targeted Recruitment",
      description: "Use advanced filters to find candidates that perfectly match your requirements."
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description: "All candidates are verified and assessed for skills and qualifications."
    }
  ];

  const features = [
    "Post unlimited job openings",
    "Advanced candidate filtering",
    "Direct candidate communication",
    "Applicant tracking system",
    "Interview scheduling tools",
    "Background verification services",
    "Skill assessment integration",
    "Analytics and reporting"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
            <Building className="h-5 w-5" />
            <span className="text-sm font-medium">Job Providers</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Hire the Best Talent</h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto mb-8">
            Find qualified candidates quickly and efficiently with our comprehensive recruitment platform.
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Streamline Your Hiring Process</h2>
            <p className="text-xl text-gray-600">Discover how our platform can transform your recruitment strategy</p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video">
                <iframe
                  src={videoUrl}
                  title="Job Providers Guide"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Employers Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful companies that have found their perfect employees through our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <benefit.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop" 
                alt="Hiring Success"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm opacity-90">Companies Hiring</div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Complete Recruitment Solution
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Everything you need to find, evaluate, and hire the best candidates for your organization.
              </p>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Hiring Today
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Join our platform and get access to a pool of qualified candidates ready to contribute to your success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-green-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
            >
              Post Your First Job
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobProviders;