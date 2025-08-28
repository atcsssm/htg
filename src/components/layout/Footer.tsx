import React from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const { settings } = useAdmin();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  className="h-12 w-50 object-cover shadow-lg"
                  onError={(e) => {
                    // Fallback to default logo if image fails to load
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                </span>
                
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Leading technology solutions provider specializing in education platforms, job portals, and innovative software development. 
              Empowering businesses and individuals through cutting-edge technology.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="bg-emerald-600 p-2 rounded-lg">
                  <Mail className="h-4 w-4" />
                </div>
                <span>support@mlmplatform.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="bg-teal-600 p-2 rounded-lg">
                  <Phone className="h-4 w-4" />
                </div>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="bg-cyan-600 p-2 rounded-lg">
                  <MapPin className="h-4 w-4" />
                </div>
                <span>123 Business Ave, Tech City, TC 12345</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { to: "/join-learner", label: "Join as Learner" },
                { to: "/join-tutor", label: "Join as Tutor" },
                { to: "/courses", label: "Course Catalog" },
                { to: "/about", label: "About Us" }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.to} 
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 flex items-center space-x-2 group"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full group-hover:bg-emerald-400 transition-colors"></div>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Support</h3>
            <ul className="space-y-3">
              {[
                { label: "Help Center", to: "/faq" },
                { label: "Contact Us", to: "/contact" },
                { label: "Terms of Service", to: "/policies" },
                { label: "Privacy Policy", to: "/policies" },
                { label: "FAQ", to: "/faq" }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.to} 
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 flex items-center space-x-2 group"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full group-hover:bg-teal-400 transition-colors"></div>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Social Media & Copyright */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#", color: "hover:text-blue-400" },
                { icon: Twitter, href: "#", color: "hover:text-sky-400" },
                { icon: Linkedin, href: "#", color: "hover:text-blue-500" },
                { icon: Instagram, href: "#", color: "hover:text-pink-400" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`bg-gray-800 p-3 rounded-xl text-gray-400 ${social.color} transition-all duration-200 hover:bg-gray-700 transform hover:scale-110`}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Built with ❤️ for innovation and excellence
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;