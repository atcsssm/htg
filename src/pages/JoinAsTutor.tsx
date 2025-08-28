import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  GraduationCap, 
  TrendingUp, 
  Users, 
  Globe, 
  CheckCircle, 
  Star,
  Zap,
  Shield,
  Target,
  BarChart3,
  DollarSign
} from 'lucide-react';

const JoinAsTutor: React.FC = () => {
  const benefits = [
    {
      icon: DollarSign,
      title: "Flexible Earnings",
      description: "Set your own hourly rates and earn money teaching subjects you're passionate about.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Users,
      title: "Global Reach",
      description: "Teach students from around the world and build a diverse learning community.",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: BarChart3,
      title: "Teaching Analytics",
      description: "Track your teaching performance, student progress, and earnings with detailed analytics.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Safe and secure environment with verified students and protected payment processing.",
      color: "from-yellow-500 to-orange-600"
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Submit Application",
      description: "Complete our tutor application with your qualifications and teaching experience.",
      image: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    },
    {
      step: "2",
      title: "Verification Process",
      description: "Our team reviews your credentials and verifies your expertise in your subject areas.",
      image: "https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    },
    {
      step: "3",
      title: "Profile Setup",
      description: "Create your tutor profile, set your rates, and define your availability schedule.",
      image: "https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    },
    {
      step: "4",
      title: "Start Teaching",
      description: "Get matched with students and begin your rewarding teaching journey.",
      image: "https://images.pexels.com/photos/5212662/pexels-photo-5212662.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      subject: "Programming & Web Development",
      earnings: "$4,500/month",
      quote: "Teaching on this platform has been incredibly rewarding. The students are motivated and the tools are excellent.",
      image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      rating: 5
    },
    {
      name: "Prof. Michael Chen",
      subject: "Mathematics & Physics",
      earnings: "$3,800/month",
      quote: "I love the flexibility to teach students globally while maintaining my academic career.",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      rating: 5
    },
    {
      name: "Dr. Emma Davis",
      subject: "Chemistry & Biology",
      earnings: "$3,200/month",
      quote: "The platform's tools make it easy to create engaging lessons and track student progress effectively.",
      image: "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-blue-900 to-indigo-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/5212662/pexels-photo-5212662.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop" 
            alt="Join as Tutor"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
                <GraduationCap className="h-5 w-5 text-green-300" />
                <span className="text-sm font-medium">Tutor Application</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Share Your <span className="bg-gradient-to-r from-green-300 to-blue-400 bg-clip-text text-transparent">Knowledge</span>
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Join our community of expert tutors and help students worldwide achieve their learning goals while earning a flexible income.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/tutor/register"
                  className="group bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-green-300 hover:to-blue-400 transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <span>Apply as Tutor</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/contact"
                  className="group border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-green-900 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm"
                >
                  <span>Learn More</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-6">Tutor Earnings</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-300 mb-2">$75</div>
                    <div className="text-sm text-gray-300">Average Hourly Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-300 mb-2">$3.5K</div>
                    <div className="text-sm text-gray-300">Monthly Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-300 mb-2">500+</div>
                    <div className="text-sm text-gray-300">Active Tutors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-300 mb-2">4.9</div>
                    <div className="text-sm text-gray-300">Average Rating</div>
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
            <div className="inline-flex items-center space-x-2 bg-green-100 rounded-full px-6 py-3 mb-6">
              <Target className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-600">Tutor Benefits</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Teach With Us?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join a platform that values education and provides the tools you need to be an effective teacher.
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

      {/* Process Steps */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-100 rounded-full px-6 py-3 mb-6">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">Application Process</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple Application Process
            </h2>
            <p className="text-xl text-gray-600">
              Start teaching in just four steps
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
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-24 -right-4 w-8 h-0.5 bg-gradient-to-r from-green-300 to-blue-300"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
              <Star className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-medium">Success Stories</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Tutor Success Stories
            </h2>
            <p className="text-xl text-gray-300">
              See how educators like you are thriving on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-colors">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-white">{testimonial.name}</h4>
                    <p className="text-gray-300 text-sm">{testimonial.subject}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-2xl text-center">
                  <div className="text-2xl font-bold">{testimonial.earnings}</div>
                  <div className="text-sm opacity-90">average monthly earnings</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Tutor Requirements
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join our community of expert educators and make a difference.
              </p>
              <div className="space-y-4">
                {[
                  "Bachelor's degree or equivalent experience",
                  "Expertise in at least one subject area",
                  "Strong communication skills",
                  "Reliable internet connection and quiet teaching space",
                  "Passion for teaching and helping students succeed"
                ].map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/5212662/pexels-photo-5212662.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop" 
                alt="Requirements"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-2xl font-bold">Ready to Teach?</div>
                <div className="text-sm opacity-90">Join 500+ expert tutors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Start Teaching?
          </h2>
          <p className="text-xl text-green-100 mb-12 max-w-3xl mx-auto">
            Join our platform and start making a difference in students' lives while building a rewarding teaching career.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              to="/tutor/register"
              className="group bg-white text-green-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <GraduationCap className="h-6 w-6" />
              <span>Apply Now</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="group border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center space-x-3 backdrop-blur-sm"
            >
              <Globe className="h-5 w-5" />
              <span>Contact Us</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-75">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-6 w-6" />
              <span className="text-sm">Secure Platform</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-6 w-6" />
              <span className="text-sm">Verified Tutors</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Globe className="h-6 w-6" />
              <span className="text-sm">Global Reach</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Growing Community</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JoinAsTutor;