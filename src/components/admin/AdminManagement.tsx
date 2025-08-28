import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {
  Shield,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Check,
  X,
  Calendar,
  Mail,
  UserCheck,
  UserX,
  Key
} from 'lucide-react';

interface SubAdmin {
  id: string;
  email: string;
  fullName: string;
  permissions: {
    users: { read: boolean; write: boolean; delete: boolean };
    subscriptions: { read: boolean; write: boolean; delete: boolean };
    payments: { read: boolean; write: boolean; delete: boolean };
    settings: { read: boolean; write: boolean; delete: boolean };
    admins: { read: boolean; write: boolean; delete: boolean };
    reports: { read: boolean; write: boolean; delete: boolean };
  };
  isActive: boolean;
  createdBy: string;
  lastLogin?: string;
  createdAt: string;
}

const AdminManagement: React.FC = () => {
  const { admin, hasPermission, getSubAdmins, createSubAdmin, updateSubAdmin, deleteSubAdmin, resetSubAdminPassword } = useAdminAuth();
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<SubAdmin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [newSubAdmin, setNewSubAdmin] = useState({
    email: '',
    fullName: '',
    permissions: {
      users: { read: false, write: false, delete: false },
      subscriptions: { read: false, write: false, delete: false },
      payments: { read: false, write: false, delete: false },
      settings: { read: false, write: false, delete: false },
      admins: { read: false, write: false, delete: false },
      reports: { read: false, write: false, delete: false }
    }
  });

  useEffect(() => {
    loadSubAdmins();
  }, []);

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

  const handleToggleStatus = async (subAdminId: string, currentStatus: boolean) => {
    try {
      await updateSubAdmin(subAdminId, { isActive: !currentStatus });
      loadSubAdmins();
    } catch (error) {
      console.error('Failed to update sub-admin status:', error);
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

  const filteredSubAdmins = subAdmins.filter(subAdmin => {
    const matchesSearch = 
      subAdmin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subAdmin.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && subAdmin.isActive) ||
      (statusFilter === 'inactive' && !subAdmin.isActive);

    return matchesSearch && matchesStatus;
  });

  const getPermissionSummary = (permissions: SubAdmin['permissions']) => {
    const totalPermissions = Object.values(permissions).reduce((total, modulePerms) => {
      return total + Object.values(modulePerms).filter(Boolean).length;
    }, 0);
    const maxPermissions = Object.keys(permissions).length * 3; // 3 actions per module
    return `${totalPermissions}/${maxPermissions}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Admin Management</h3>
              <p className="text-gray-600">Manage sub-administrators and their permissions</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Total: {subAdmins.length} sub-admins
            </div>
            {hasPermission('admins', 'write') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Sub-Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Search by name or email..."
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Current Super Admin Info */}
      <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 w-12 h-12 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{admin?.fullName}</h4>
            <p className="text-sm text-gray-600">{admin?.email}</p>
            <div className="flex items-center space-x-4 mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <Shield className="h-3 w-3 mr-1" />
                Super Administrator
              </span>
              <span className="text-xs text-gray-500">
                Full system access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Admins List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sub-Admin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubAdmins.map((subAdmin) => (
              <tr key={subAdmin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {subAdmin.fullName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {subAdmin.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subAdmin.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getPermissionSummary(subAdmin.permissions)} permissions
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSubAdmin(subAdmin);
                      setShowPermissionsModal(true);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View details
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    subAdmin.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {subAdmin.isActive ? (
                      <>
                        <UserCheck className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <UserX className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subAdmin.lastLogin ? (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(subAdmin.lastLogin).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className="text-gray-400">Never</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(subAdmin.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedSubAdmin(subAdmin);
                        setShowPermissionsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Permissions"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {hasPermission('admins', 'write') && (
                      <>
                        <button
                          onClick={() => handleToggleStatus(subAdmin.id, subAdmin.isActive)}
                          className={`${
                            subAdmin.isActive
                              ? 'text-red-600 hover:text-red-800'
                              : 'text-green-600 hover:text-green-800'
                          }`}
                          title={subAdmin.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {subAdmin.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleResetPassword(subAdmin.id)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Reset Password"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {hasPermission('admins', 'delete') && (
                      <button
                        onClick={() => handleDeleteSubAdmin(subAdmin.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Sub-Admin"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSubAdmins.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sub-admins found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'No sub-administrators have been created yet'
            }
          </p>
          {hasPermission('admins', 'write') && !searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Create First Sub-Admin
            </button>
          )}
        </div>
      )}

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

export default AdminManagement;