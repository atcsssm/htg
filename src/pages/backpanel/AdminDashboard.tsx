import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import GeneralSettings from '../../components/admin/GeneralSettings';
import RegistrationSettings from '../../components/admin/RegistrationSettings';
import CustomerManagement from '../../components/admin/CustomerManagement';
import LearnerManagement from '../../components/admin/LearnerManagement';
import TutorManagement from '../../components/admin/TutorManagement';
import CourseManagement from '../../components/admin/CourseManagement';
import CourseCategoryManagement from '../../components/admin/CourseCategoryManagement';
import SubscriptionManagement from '../../components/admin/SubscriptionManagement';
import PaymentManagement from '../../components/admin/PaymentManagement';
import SMTPSettings from '../../components/admin/SMTPSettings';
import SMSSettings from '../../components/admin/SMSSettings';
import AdminManagement from '../../components/admin/AdminManagement';
import {
  Users,
  Building,
  CreditCard,
  Settings,
  UserPlus,
  Shield,
  Activity,
  BarChart3,
  FileText,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Plus,
  Check,
  X,
  Globe,
  UserCheck,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Folder
} from 'lucide-react';

interface SubAdmin {
  id: string;
  email: string;
  fullName: string;
  permissions: any;
  isActive: boolean;
  createdBy: string;
  lastLogin?: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { admin, hasPermission, getSubAdmins, createSubAdmin, updateSubAdmin, deleteSubAdmin, resetSubAdminPassword, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<SubAdmin | null>(null);
  const [loading, setLoading] = useState(false);

  const [newSubAdmin, setNewSubAdmin] = useState({
    email: '',
    fullName: '',
    permissions: {
      users: { read: false, write: false, delete: false },
      companies: { read: false, write: false, delete: false },
      subscriptions: { read: false, write: false, delete: false },
      payments: { read: false, write: false, delete: false },
      settings: { read: false, write: false, delete: false },
      admins: { read: false, write: false, delete: false },
      reports: { read: false, write: false, delete: false }
    }
  });

  useEffect(() => {
    if (activeTab === 'admins' && hasPermission('admins', 'read')) {
      loadSubAdmins();
    }
  }, [activeTab]);

  const loadSubAdmins = async () => {
    setLoading(true);
    try {
      const data = await getSubAdmins();
      setSubAdmins(data);
    } catch (error) {
      console.error('Failed to load sub-admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubAdmin(newSubAdmin);
      setShowCreateModal(false);
      setNewSubAdmin({
        email: '',
        fullName: '',
        permissions: {
          users: { read: false, write: false, delete: false },
          companies: { read: false, write: false, delete: false },
          subscriptions: { read: false, write: false, delete: false },
          payments: { read: false, write: false, delete: false },
          settings: { read: false, write: false, delete: false },
          admins: { read: false, write: false, delete: false },
          reports: { read: false, write: false, delete: false }
        }
      });
      loadSubAdmins();
    } catch (error) {
      console.error('Failed to create sub-admin:', error);
    }
  };

  const handleResetPassword = async (subAdminId: string) => {
    if (confirm('Are you sure you want to reset this sub-admin\'s password?')) {
      try {
        await resetSubAdminPassword(subAdminId);
      } catch (error) {
        console.error('Failed to reset password:', error);
      }
    }
  };

  const handleDeleteSubAdmin = async (subAdminId: string) => {
    if (confirm('Are you sure you want to delete this sub-admin? This action cannot be undone.')) {
      try {
        await deleteSubAdmin(subAdminId);
        loadSubAdmins();
      } catch (error) {
        console.error('Failed to delete sub-admin:', error);
      }
    }
  };

  const updatePermission = (module: string, action: string, value: boolean) => {
    setNewSubAdmin(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: value
        }
      }
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/backpanel/login');
  };

  const stats = [
    {
      title: 'Total Users',
      value: '12,847',
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Companies',
      value: '234',
      icon: Building,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Active Plans',
      value: '3',
      icon: CreditCard,
      color: 'bg-purple-500',
      change: '+2'
    },
    {
      title: 'Monthly Revenue',
      value: '$45,230',
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+15%'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, permission: null },
    { id: 'learners', label: 'Learners', icon: BookOpen, permission: 'users' },
    { id: 'tutors', label: 'Tutors', icon: GraduationCap, permission: 'users' },
    { id: 'courses', label: 'Courses', icon: BookOpen, permission: 'users' },
    { id: 'categories', label: 'Course Categories', icon: Folder, permission: 'users' },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, permission: 'subscriptions' },
    { id: 'payments', label: 'Payments', icon: DollarSign, permission: 'payments' },
    { id: 'admins', label: 'Sub-Admins', icon: Shield, permission: 'admins' },
    { id: 'settings', label: 'Settings', icon: Settings, permission: 'settings' }
  ];

  const visibleTabs = tabs.filter(tab =>
      !tab.permission || hasPermission(tab.permission as any, 'read')
  );

  // Settings sub-tabs
  const [settingsTab, setSettingsTab] = useState('general');
  const settingsTabs = [
    { id: 'general', label: 'General Settings', icon: Globe },
    { id: 'registration', label: 'Registration Settings', icon: UserCheck },
    { id: 'smtp', label: 'Email Settings', icon: FileText },
    { id: 'sms', label: 'SMS Settings', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Vertical Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">Management Dashboard</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 w-10 h-10 rounded-xl flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {admin?.fullName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {admin?.role === 'super_admin' ? 'Super Admin' : 'Sub Admin'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={sidebarCollapsed ? tab.label : ''}
            >
              <tab.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-medium">{tab.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === 'overview' && 'System overview and statistics'}
                {activeTab === 'learners' && 'Manage learner accounts and learning progress'}
                {activeTab === 'tutors' && 'Manage tutor profiles and teaching activities'}
                {activeTab === 'courses' && 'Manage courses, lessons, and content'}
                {activeTab === 'categories' && 'Manage course categories and organization'}
                {activeTab === 'subscriptions' && 'Manage subscription plans and pricing'}
                {activeTab === 'payments' && 'View payment transactions and history'}
                {activeTab === 'admins' && 'Manage sub-administrators and permissions'}
                {activeTab === 'settings' && 'Configure system settings and preferences'}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div>
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

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">New user registration</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Payment received</p>
                        <p className="text-xs text-gray-500">5 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Database</span>
                      <span className="text-sm text-green-600">Online</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Payment Gateway</span>
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'learners' && hasPermission('users', 'read') && (
            <LearnerManagement />
          )}

          {activeTab === 'tutors' && hasPermission('users', 'read') && (
            <TutorManagement />
          )}

          {activeTab === 'courses' && hasPermission('users', 'read') && (
            <CourseManagement />
          )}

          {activeTab === 'categories' && hasPermission('users', 'read') && (
            <CourseCategoryManagement />
          )}


          {activeTab === 'subscriptions' && hasPermission('subscriptions', 'read') && (
            <SubscriptionManagement />
          )}

          {activeTab === 'payments' && hasPermission('payments', 'read') && (
            <PaymentManagement />
          )}

          {activeTab === 'admins' && hasPermission('admins', 'read') && (
            <AdminManagement />
          )}

          {activeTab === 'settings' && hasPermission('settings', 'read') && (
            <div className="bg-white rounded-xl shadow-sm">
              {/* Vertical Settings Navigation */}
              <div className="flex">
                <div className="w-64 border-r border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                    <p className="text-sm text-gray-600">Configure system preferences</p>
                  </div>
                  <nav className="p-4 space-y-2">
                    {settingsTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSettingsTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                          settingsTab === tab.id
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <tab.icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Settings Content */}
                <div className="flex-1 p-6">
                  {settingsTab === 'general' && <GeneralSettings />}
                  {settingsTab === 'registration' && <RegistrationSettings />}
                  {settingsTab === 'smtp' && <SMTPSettings />}
                  {settingsTab === 'sms' && <SMSSettings />}
                </div>
              </div>
            </div>
          )}

          {/* Access Denied */}
          {activeTab !== 'overview' && !hasPermission(activeTab as any, 'read') && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600">You don't have permission to access this section.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Sub-Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Sub-Admin</h3>
            <form onSubmit={handleCreateSubAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={newSubAdmin.fullName}
                  onChange={(e) => setNewSubAdmin(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={newSubAdmin.email}
                  onChange={(e) => setNewSubAdmin(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Permissions</label>
                <div className="space-y-4">
                  {Object.keys(newSubAdmin.permissions).map((module) => (
                    <div key={module} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 capitalize">{module}</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {['read', 'write', 'delete'].map((action) => (
                          <label key={action} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newSubAdmin.permissions[module][action]}
                              onChange={(e) => updatePermission(module, action, e.target.checked)}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Create Sub-Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedSubAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              Permissions for {selectedSubAdmin.fullName}
            </h3>
            <div className="space-y-3">
              {Object.entries(selectedSubAdmin.permissions).map(([module, perms]: [string, any]) => (
                <div key={module} className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2 capitalize">{module}</h4>
                  <div className="flex space-x-4 text-sm">
                    <span className={`flex items-center ${perms.read ? 'text-green-600' : 'text-gray-400'}`}>
                      {perms.read ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                      Read
                    </span>
                    <span className={`flex items-center ${perms.write ? 'text-green-600' : 'text-gray-400'}`}>
                      {perms.write ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                      Write
                    </span>
                    <span className={`flex items-center ${perms.delete ? 'text-green-600' : 'text-gray-400'}`}>
                      {perms.delete ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                      Delete
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;