import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import { Menu, X, User, LogOut, Settings, Home, ChevronDown, Building, BookOpen, GraduationCap, Users, Briefcase, LogIn, UserPlus } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleNavClick = (path: string) => {
    setIsMenuOpen(false);
    
    if (location.pathname === path) {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth',
        left: 0
      });
    } else {
      navigate(path);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.userType) {
      case 'admin':
        return '/admin/dashboard';
      case 'tutor':
        return '/tutor/dashboard';
      case 'learner':
        return '/learner/dashboard';
      case 'job_seeker':
        return '/job-seeker/dashboard';
      case 'job_provider':
        return '/job-provider/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg fixed w-full top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src={settings.logoUrl}
                  alt={settings.siteName}
                  className="h-10 w-50 object-cover shadow-md group-hover:shadow-lg transition-shadow duration-300"
                  onError={(e) => {
                    // Fallback to default logo if image fails to load
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
          
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link 
              to="/" 
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 font-medium"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/job-seekers"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
            >
              <Users className="h-4 w-4" />
              <span>Job Seekers</span>
            </Link>
            
            <Link
              to="/job-providers"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 font-medium"
            >
              <Building className="h-4 w-4" />
              <span>Job Providers</span>
            </Link>
            
            <Link
              to="/tutors"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 font-medium"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Tutors</span>
            </Link>
            
            <Link
              to="/learners"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 font-medium"
            >
              <BookOpen className="h-4 w-4" />
              <span>Learners</span>
            </Link>
            
            <Link
              to="/courses"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200 font-medium"
            >
              <BookOpen className="h-4 w-4" />
              <span>All Courses</span>
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-6 py-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {user.firstName || 'User'}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">{user.userType?.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-100">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Home</span>
            </Link>
            
            <Link
              to="/job-seekers"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Job Seekers</span>
            </Link>
            
            <Link
              to="/job-providers"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <Building className="h-5 w-5" />
              <span className="font-medium">Job Providers</span>
            </Link>
            
            <Link
              to="/tutors"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <GraduationCap className="h-5 w-5" />
              <span className="font-medium">Tutors</span>
            </Link>
            
            <Link
              to="/learners"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Learners</span>
            </Link>
            
            <Link
              to="/courses"
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">All Courses</span>
            </Link>

            {/* Mobile Auth Buttons */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              {!user ? (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center space-x-3 px-4 py-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.firstName || 'User'}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">{user.userType?.replace('_', ' ')}</div>
                    </div>
                  </div>
                  
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 w-full font-medium"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;