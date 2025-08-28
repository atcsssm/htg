import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { 
  ArrowRight, 
  Users, 
  TrendingUp, 
  Shield, 
  Award, 
  Sparkles, 
  Zap, 
  Globe,
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
  CheckCircle,
  Target,
  Rocket,
  DollarSign,
  BookOpen
} from 'lucide-react';

const Home: React.FC = () => {
  const { settings } = useAdmin();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      title: 'Master New Skills Today',
      subtitle: 'Learn from expert tutors worldwide',
      description: 'Access thousands of courses in programming, science, mathematics, and more with personalized tutoring.',
      cta: 'Start Learning',
      ctaLink: '/learner/register'
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      title: 'Expert Tutors Available',
      subtitle: 'Get personalized guidance',
      description: 'Connect with verified tutors for one-on-one sessions and accelerate your learning journey.',
      cta: 'Find Tutors',
      ctaLink: '/join-tutor'
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      title: 'Flexible Learning',
      subtitle: 'Learn at your own pace',
      description: 'Choose from free courses, time-limited access, or lifetime learning with certificates.',
      cta: 'Browse Courses',
      ctaLink: '/courses'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Slider Section */}
      <section className="relative h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            </div>
          ))}
        </div>

        {/* Slider Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <div className="mb-6">
                <span className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 text-white">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span className="text-sm font-medium">{slides[currentSlide].subtitle}</span>
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                {slides[currentSlide].title}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
                {slides[currentSlide].description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={slides[currentSlide].ctaLink}
                  className="group bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:via-indigo-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <span>{slides[currentSlide].cta}</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button 
                  className="group border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm"
                  onClick={() => {
                    const element = document.getElementById('features-section');
                    element?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start',
                      inline: 'nearest'
                    });
                  }}
                >
                  <Play className="h-5 w-5" />
                  <span>Learn More</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 rounded-full hover:bg-white/20 transition-all duration-300"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </section>

      {/* Stats Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">10K+</div>
              <div className="text-lg opacity-90">Active Learners</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">500+</div>
              <div className="text-lg opacity-90">Expert Tutors</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">1000+</div>
              <div className="text-lg opacity-90">Courses</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:scale-110 transition-transform">99.9%</div>
              <div className="text-lg opacity-90">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Unique Design */}
      <section id="features-section" className="py-20 bg-gray-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-indigo-100 rounded-full px-6 py-3 mb-6">
              <Zap className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">Revolutionary Features</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Why Choose <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">{settings.siteName}</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of MLM with our cutting-edge platform designed for maximum growth and transparency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Comprehensive Courses',
                description: 'Access thousands of courses in programming, science, mathematics, and more subjects.',
                color: 'from-blue-500 to-indigo-600',
                bgColor: 'bg-blue-50',
                iconColor: 'text-blue-600',
                image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
              },
              {
                icon: Users,
                title: 'Expert Tutors',
                description: 'Learn from verified tutors with years of experience in their respective fields.',
                color: 'from-cyan-500 to-blue-600',
                bgColor: 'bg-cyan-50',
                iconColor: 'text-cyan-600',
                image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
              },
              {
                icon: TrendingUp,
                title: 'Progress Tracking',
                description: 'Monitor your learning progress with detailed analytics and achievement tracking.',
                color: 'from-violet-500 to-purple-600',
                bgColor: 'bg-violet-50',
                iconColor: 'text-violet-600',
                image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
              },
              {
                icon: Award,
                title: 'Certificates',
                description: 'Earn verified certificates upon course completion to showcase your new skills.',
                color: 'from-rose-500 to-pink-600',
                bgColor: 'bg-rose-50',
                iconColor: 'text-rose-600',
                image: 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-4 overflow-hidden">
                  {/* Feature Image */}
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  
                  <div className="p-8 relative">
                    <div className={`${feature.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 -mt-12 relative z-10 shadow-lg`}>
                      <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{feature.title}</h3>
                    <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Banner */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop" 
            alt="Success Stories"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
            <Star className="h-5 w-5 text-yellow-300" />
            <span className="text-sm font-medium">Success Stories</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Join Our Success Stories
          </h2>
          <p className="text-xl mb-12 text-gray-200 max-w-3xl mx-auto">
            Thousands of entrepreneurs have transformed their lives with our platform. Your success story starts here.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { name: "Sarah Johnson", achievement: "Full-Stack Developer", period: "6 months", image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop" },
              { name: "Michael Chen", achievement: "Data Scientist", period: "8 months", image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop" },
              { name: "Emma Davis", achievement: "Physics Teacher", period: "1 year", image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop" }
            ].map((story, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <img 
                  src={story.image} 
                  alt={story.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold mb-2">{story.name}</h3>
                <p className="text-2xl font-bold text-green-400 mb-1">{story.achievement}</p>
                <p className="text-gray-300">Completed in {story.period}</p>
              </div>
            ))}
          </div>
          
          <Link
            to="/learner/register"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-blue-300 hover:to-indigo-400 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Rocket className="h-6 w-6" />
            <span>Start Learning Today</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-100 rounded-full px-6 py-3 mb-6">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: '1',
                title: 'Create Account',
                description: 'Sign up as a learner or tutor and complete your profile with learning goals.',
                color: 'from-emerald-500 to-teal-600',
                image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
              },
              {
                step: '2',
                title: 'Browse Courses',
                description: 'Explore our extensive catalog of courses and choose what interests you most.',
                color: 'from-cyan-500 to-blue-600',
                image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
              },
              {
                step: '3',
                title: 'Start Learning',
                description: 'Enroll in courses, get assigned a tutor, and begin your educational journey.',
                color: 'from-violet-500 to-purple-600',
                image: 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
              }
            ].map((step, index) => (
              <div key={index} className="text-center group relative">
                <div className="relative mb-8">
                  <div className="relative overflow-hidden rounded-2xl">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className={`absolute top-4 left-4 bg-gradient-to-r ${step.color} text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg`}>
                      {step.step}
                    </div>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-32 -right-6 w-12 h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop" 
            alt="Join Now"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <span className="text-sm font-medium">Ready to Transform Your Life?</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Your Learning Journey Awaits
          </h2>
          <p className="text-xl mb-12 text-gray-200 max-w-3xl mx-auto">
            Join thousands of learners who have transformed their careers through our comprehensive education platform. 
            Start your journey today and unlock unlimited learning potential.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              to="/learner/register"
             className="group bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-emerald-300 hover:to-teal-400 transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <BookOpen className="h-6 w-6" />
              <span>Start Learning Today</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/courses"
              className="group border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-emerald-900 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm"
             onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <CheckCircle className="h-5 w-5" />
              <span>Browse Courses</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-75">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-sm">SSL Secured</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-6 w-6 text-blue-400" />
              <span className="text-sm">Verified Tutors</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-6 w-6 text-blue-400" />
              <span className="text-sm">10K+ Learners</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Award className="h-6 w-6 text-blue-400" />
              <span className="text-sm">Certified Courses</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;