import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserEnrollments } from '../../lib/supabase';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Award,
  Play,
  Calendar,
  User,
  BarChart3,
  CheckCircle,
  Star
} from 'lucide-react';

interface Enrollment {
  tce_id: string;
  tce_progress_percentage: number;
  tce_enrollment_date: string;
  tce_access_expires_at?: string;
  tbl_courses: {
    tc_title: string;
    tc_thumbnail_url: string;
    tc_difficulty_level: string;
    tc_duration_hours: number;
    tbl_course_categories: {
      tcc_name: string;
      tcc_color: string;
    };
  };
}

const LearnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadEnrollments();
    }
  }, [user?.id]);

  const loadEnrollments = async () => {
    try {
      const data = await getUserEnrollments(user!.id);
      setEnrollments(data || []);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Enrolled Courses',
      value: enrollments.length,
      icon: BookOpen,
      color: 'bg-blue-500',
      change: '+2 this month'
    },
    {
      title: 'Completed Courses',
      value: enrollments.filter(e => e.tce_progress_percentage === 100).length,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+1 this week'
    },
    {
      title: 'Learning Hours',
      value: enrollments.reduce((total, e) => total + (e.tbl_courses?.tc_duration_hours || 0), 0),
      icon: Clock,
      color: 'bg-purple-500',
      change: '+5h this week'
    },
    {
      title: 'Certificates',
      value: enrollments.filter(e => e.tce_progress_percentage === 100).length,
      icon: Award,
      color: 'bg-yellow-500',
      change: '+1 earned'
    }
  ];

  const recentActivities = [
    {
      type: 'course_start',
      message: 'Started JavaScript Fundamentals course',
      time: '2 hours ago',
      icon: Play
    },
    {
      type: 'lesson_complete',
      message: 'Completed lesson: Variables and Data Types',
      time: '1 day ago',
      icon: CheckCircle
    },
    {
      type: 'certificate',
      message: 'Earned certificate for HTML & CSS Basics',
      time: '3 days ago',
      icon: Award
    }
  ];

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Continue your learning journey and track your progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'courses', label: 'My Courses', icon: BookOpen },
                { id: 'progress', label: 'Progress', icon: TrendingUp },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
                { id: 'tutor', label: 'My Tutor', icon: User }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
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
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <activity.icon className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                      Browse New Courses
                    </button>
                    <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                      Schedule Tutor Session
                    </button>
                    <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                      View Certificates
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Enrolled Courses</h3>
                  <div className="text-sm text-gray-500">
                    {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse"></div>
                    ))}
                  </div>
                ) : enrollments.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled yet</h3>
                    <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                      Browse Courses
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((enrollment) => (
                      <div key={enrollment.tce_id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                        <div className="relative">
                          <img
                            src={enrollment.tbl_courses?.tc_thumbnail_url}
                            alt={enrollment.tbl_courses?.tc_title}
                            className="w-full h-48 object-cover rounded-t-xl"
                          />
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(enrollment.tbl_courses?.tc_difficulty_level)}`}>
                              {enrollment.tbl_courses?.tc_difficulty_level}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">
                              {enrollment.tbl_courses?.tbl_course_categories?.tcc_name}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{enrollment.tbl_courses?.tc_duration_hours}h</span>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                            {enrollment.tbl_courses?.tc_title}
                          </h3>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{enrollment.tce_progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${enrollment.tce_progress_percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                            Continue Learning
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'progress' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Progress</h3>
                
                {/* Overall Progress */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl mb-6">
                  <h4 className="text-lg font-semibold mb-2">Overall Learning Progress</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-2xl font-bold">85%</div>
                      <div className="text-sm opacity-90">Average Progress</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">24h</div>
                      <div className="text-sm opacity-90">Time Spent</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-sm opacity-90">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">2</div>
                      <div className="text-sm opacity-90">Certificates</div>
                    </div>
                  </div>
                </div>

                {/* Course Progress Details */}
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.tce_id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-4">
                        <img
                          src={enrollment.tbl_courses?.tc_thumbnail_url}
                          alt={enrollment.tbl_courses?.tc_title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{enrollment.tbl_courses?.tc_title}</h4>
                          <p className="text-sm text-gray-600">{enrollment.tbl_courses?.tbl_course_categories?.tcc_name}</p>
                          <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span className="font-medium">{enrollment.tce_progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full" 
                                style={{ width: `${enrollment.tce_progress_percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Enrolled</div>
                          <div className="text-sm font-medium">
                            {new Date(enrollment.tce_enrollment_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Upcoming Sessions</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h4>
                  <p className="text-gray-600 mb-6">Schedule a session with your tutor to get personalized guidance</p>
                  <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                    Schedule Session
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'tutor' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">My Assigned Tutor</h3>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <img
                      src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
                      alt="Tutor"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900">Dr. Sarah Johnson</h4>
                      <p className="text-indigo-600 mb-2">Senior Programming Instructor</p>
                      <p className="text-gray-600 text-sm mb-4">
                        Experienced software engineer with 10+ years in web development and education. 
                        Specializes in JavaScript, React, and modern web technologies.
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>4.9 rating</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>234 students</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>15 courses</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mb-2">
                        Message Tutor
                      </button>
                      <div className="text-sm text-gray-500">
                        $75/hour
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerDashboard;