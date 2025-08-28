import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Award, 
  CheckCircle, 
  Star,
  Zap,
  Shield,
  Target,
  Clock,
  Globe
} from 'lucide-react';

const JoinAsLearner: React.FC = () => {
  const benefits = [
    {
      icon: BookOpen,
      title: "Unlimited Course Access",
      description: "Access thousands of courses in programming, science, mathematics, and more subjects.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Users,
      title: "Expert Tutors",
      description: "Learn from verified tutors with years of experience in their respective fields.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your learning progress with detailed analytics and achievement tracking.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Award,
      title: "Certificates",
      description: "Earn verified certificates upon course completion to showcase your skills.",
      color: "from-yellow-500 to-orange-600"
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Create Your Account",
      description: "Sign up with your basic information and set your learning goals.",
      image: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    },
    {
      step: "2",
      title: "Choose Your Courses",
      description: "Browse our extensive catalog and enroll in courses that interest you.",
      image: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    },
    {
      step: "3",
      title: "Get Assigned a Tutor",
      description: "Our system will assign you a qualified tutor based on your learning needs.",
      image: "https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    },
    {
      step: "4",
      title: "Start Learning",
      description: "Begin your educational journey with personalized guidance and support.",
      image: "https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      achievement: "Full-Stack Developer",
      quote: "The personalized tutoring helped me transition from marketing to web development in just 6 months.",
      image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      rating: 5
    },
    {
      name: "Michael Chen",
      achievement: "Data Scientist",
      quote: "The mathematics and programming courses gave me the foundation I needed for my data science career.",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      rating: 5
    },
    {
      name: "Emma Davis",
      achievement: "Physics Teacher",
      quote: "The advanced physics courses helped me become a better educator and understand complex concepts.",
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop" 
            alt="Join as Learner"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
                <Target className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium">Learner Registration</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Start Your <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">Learning Journey</span>
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Join thousands of learners mastering new skills with expert tutors in programming, science, mathematics, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/learner/register"
                  className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-2xl font-bold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <span>Register Now</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/courses"
                  className="group border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-indigo-900 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm"
                >
                  <span>Browse Courses</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-6">Platform Stats</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-300 mb-2">10K+</div>
                    <div className="text-sm text-gray-300">Active Learners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-300 mb-2">500+</div>
                    <div className="text-sm text-gray-300">Expert Tutors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-300 mb-2">1000+</div>
                    <div className="text-sm text-gray-300">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-300 mb-2">95%</div>
                    <div className="text-sm text-gray-300">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-indigo-100 rounded-full px-6 py-3 mb-6">
              <Award className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">Learner Benefits</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Learn With Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience personalized education with expert tutors and comprehensive course materials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group relative">
                <div className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2">
                  <div className={`bg-gradient-to-r ${benefit.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-100 rounded-full px-6 py-3 mb-6">
              <Zap className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">Simple Process</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Get Started in 4 Easy Steps
            </h2>
            <p className="text-xl text-gray-600">
              Begin your learning journey in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group relative">
                <div className="relative mb-8">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-24 -right-4 w-8 h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-6 py-3 mb-6">
              <Star className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-600">Success Stories</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our Learners Say
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from real learners achieving real success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-3xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-indigo-600 font-semibold">{testimonial.achievement}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Learner Requirements
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                Simple requirements to start your learning journey.
              </p>
              <div className="space-y-4">
                {[
                  "Must be 13 years or older",
                  "Valid email address and phone number",
                  "Basic computer/internet access",
                  "Commitment to learning and growth",
                  "Willingness to engage with tutors and community"
                ].map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
                    <span className="text-indigo-100">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop" 
                alt="Requirements"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 p-6 rounded-2xl shadow-xl">
                <div className="text-2xl font-bold">Ready to Learn?</div>
                <div className="text-sm opacity-90">Join thousands of successful learners</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Future?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Join our community of learners and start building the skills you need for success. 
            Your educational journey starts with a single click.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              to="/learner/register"
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <BookOpen className="h-6 w-6" />
              <span>Start Learning Today</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/courses"
              className="group border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Browse Courses</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-75">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-6 w-6 text-gray-600" />
              <span className="text-sm text-gray-600">Secure Platform</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-6 w-6 text-gray-600" />
              <span className="text-sm text-gray-600">Verified Tutors</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-6 w-6 text-gray-600" />
              <span className="text-sm text-gray-600">10K+ Learners</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Award className="h-6 w-6 text-gray-600" />
              <span className="text-sm text-gray-600">Certified Courses</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JoinAsLearner;