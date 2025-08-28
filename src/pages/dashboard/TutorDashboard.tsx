import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  TrendingUp, 
  DollarSign,
  Calendar,
  BookOpen,
  Star,
  Clock,
  Video,
  MessageSquare,
  Award
} from 'lucide-react';

const TutorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: 'Total Students',
      value: '47',
      icon: Users,
      color: 'bg-blue-500',
      change: '+5 this month'
    },
    {
      title: 'Monthly Earnings',
      value: '$3,250',
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12% from last month'
    },
    {
      title: 'Teaching Hours',
      value: '156h',
      icon: Clock,
      color: 'bg-purple-500',
      change: '+8h this week'
    },
    {
      title: 'Average Rating',
      value: '4.9',
      icon: Star,
      color: 'bg-yellow-500',
      change: '23 reviews'
    }
  ];

  const upcomingSessions = [
    {
      student: 'Alex Thompson',
      course: 'JavaScript Fundamentals',
      time: '2:00 PM - 3:00 PM',
      date: 'Today',
      type: 'live'
    },
    {
      student: 'Maria Garcia',
      course: 'React Development',
      time: '4:00 PM - 5:00 PM',
      date: 'Tomorrow',
      type: 'live'
    },
    {
      student: 'David Kim',
      course: 'Advanced JavaScript',
      time: '10:00 AM - 11:00 AM',
      date: 'Friday',
      type: 'recorded'
    }
  ];

  const recentActivities = [
    {
      type: 'session',
      message: 'Completed session with Alex Thompson',
      time: '2 hours ago',
      icon: Video
    },
    {
      type: 'review',
      message: 'Received 5-star review from Maria Garcia',
      time: '1 day ago',
      icon: Star
    },
    {
      type: 'student',
      message: 'New student assigned: David Kim',
      time: '2 days ago',
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Tutor Dashboard - Manage your students and teaching schedule
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
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'students', label: 'My Students', icon: Users },
                { id: 'sessions', label: 'Sessions', icon: Video },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
                { id: 'earnings', label: 'Earnings', icon: DollarSign },
                { id: 'profile', label: 'Profile', icon: Award }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
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
                {/* Upcoming Sessions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
                  <div className="space-y-4">
                    {upcomingSessions.map((session, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="bg-green-100 p-3 rounded-full">
                          <Video className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{session.student}</h4>
                          <p className="text-sm text-gray-600">{session.course}</p>
                          <p className="text-sm text-gray-500">{session.date} • {session.time}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.type === 'live' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {session.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-green-100 p-2 rounded-full">
                          <activity.icon className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Students</h3>
                  <div className="text-sm text-gray-500">47 active students</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'Alex Thompson', course: 'JavaScript Fundamentals', progress: 75, lastActive: '2 hours ago' },
                    { name: 'Maria Garcia', course: 'React Development', progress: 60, lastActive: '1 day ago' },
                    { name: 'David Kim', course: 'Advanced JavaScript', progress: 90, lastActive: '3 hours ago' },
                    { name: 'Sarah Wilson', course: 'Node.js Backend', progress: 45, lastActive: '2 days ago' },
                    { name: 'John Davis', course: 'JavaScript Fundamentals', progress: 30, lastActive: '1 week ago' },
                    { name: 'Lisa Chen', course: 'React Development', progress: 85, lastActive: '5 hours ago' }
                  ].map((student, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">{student.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-600">{student.course}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span className="font-medium">{student.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Last active: {student.lastActive}</span>
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Session Management</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Today's Sessions</h4>
                    <p className="text-2xl font-bold text-blue-600 mt-2">3</p>
                    <p className="text-sm text-blue-600 mt-1">2 live, 1 recorded</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-green-900">This Week</h4>
                    <p className="text-2xl font-bold text-green-600 mt-2">12</p>
                    <p className="text-sm text-green-600 mt-1">Total sessions</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-purple-900">Total Hours</h4>
                    <p className="text-2xl font-bold text-purple-600 mt-2">18h</p>
                    <p className="text-sm text-purple-600 mt-1">This week</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">Session History</h4>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Schedule New Session
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600">Session management interface will be displayed here.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'earnings' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Earnings Overview</h3>
                
                <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-lg mb-6">
                  <h4 className="text-lg font-semibold">Total Earnings</h4>
                  <p className="text-3xl font-bold mt-2">$12,450.00</p>
                  <p className="text-green-100 mt-1">+15% from last month</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900">This Month</h5>
                    <p className="text-xl font-bold text-gray-700 mt-1">$3,250.00</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900">Hourly Rate</h5>
                    <p className="text-xl font-bold text-gray-700 mt-1">$75.00</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Tutor Profile</h3>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-6">
                    <img
                      src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {user?.firstName} {user?.lastName}
                      </h4>
                      <p className="text-green-600 mb-4">Senior Programming Instructor</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-900">{user?.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Specializations</label>
                          <p className="text-gray-900">JavaScript, React, Node.js</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Experience</label>
                          <p className="text-gray-900">10+ years</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Rating</label>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-gray-900">4.9 (23 reviews)</span>
                          </div>
                        </div>
                      </div>
                      
                      <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Edit Profile
                      </button>
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

export default TutorDashboard;