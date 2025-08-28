import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../ui/NotificationProvider';
import {
  GraduationCap,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Settings,
  TrendingUp,
  Award,
  Clock,
  DollarSign,
  Star,
  Users,
  BookOpen
} from 'lucide-react';

interface Tutor {
  tu_id: string;
  tu_email: string;
  tu_user_type: string;
  tu_is_verified: boolean;
  tu_email_verified: boolean;
  tu_mobile_verified: boolean;
  tu_is_active: boolean;
  tu_created_at: string;
  tbl_user_profiles: {
    tup_first_name: string;
    tup_last_name: string;
    tup_username: string;
    tup_mobile: string;
    tup_gender: string;
    tup_education_level: string;
  } | null;
  tbl_tutors: {
    tt_id: string;
    tt_bio: string;
    tt_specializations: string[];
    tt_experience_years: number;
    tt_education: string;
    tt_hourly_rate: number;
    tt_rating: number;
    tt_total_reviews: number;
    tt_total_students: number;
    tt_is_verified: boolean;
    tt_is_active: boolean;
  } | null;
}

interface Assignment {
  tta_id: string;
  tta_assignment_date: string;
  tta_status: string;
  tbl_users: {
    tbl_user_profiles: {
      tup_first_name: string;
      tup_last_name: string;
    };
  };
  tbl_courses: {
    tc_title: string;
  };
}

const TutorManagement: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showTutorDetails, setShowTutorDetails] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const notification = useNotification();

  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading tutors from database...');

      const { data: tutors, error } = await supabase
        .from('tbl_users')
        .select(`
          tu_id,
          tu_email,
          tu_user_type,
          tu_is_verified,
          tu_email_verified,
          tu_mobile_verified,
          tu_is_active,
          tu_created_at,
          tu_updated_at,
          tbl_user_profiles (
            tup_id,
            tup_first_name,
            tup_last_name,
            tup_username,
            tup_mobile,
            tup_gender,
            tup_education_level,
            tup_created_at,
            tup_updated_at
          ),
          tbl_tutors (
            tt_id,
            tt_bio,
            tt_specializations,
            tt_experience_years,
            tt_education,
            tt_hourly_rate,
            tt_rating,
            tt_total_reviews,
            tt_total_students,
            tt_is_verified,
            tt_is_active
          )
        `)
        .eq('tu_user_type', 'tutor')
        .order('tu_created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to load tutors:', error);
        throw error;
      }

      console.log('✅ Tutors loaded:', tutors);
      setTutors(tutors || []);
    } catch (error) {
      console.error('❌ Failed to load tutors:', error);
      setError('Failed to load tutors. Please check your database connection.');
      notification.showError('Load Failed', 'Failed to load tutor data from database');
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch =
      (tutor.tu_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (tutor.tbl_user_profiles?.tup_first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (tutor.tbl_user_profiles?.tup_last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (tutor.tbl_user_profiles?.tup_username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (tutor.tbl_tutors?.tt_specializations?.some(spec => 
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      ) || false);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && tutor.tu_is_active) ||
      (statusFilter === 'inactive' && !tutor.tu_is_active);

    const matchesVerification =
      verificationFilter === 'all' ||
      (verificationFilter === 'verified' && tutor.tbl_tutors?.tt_is_verified) ||
      (verificationFilter === 'unverified' && !tutor.tbl_tutors?.tt_is_verified);

    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleViewTutor = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setShowTutorDetails(true);
    setActiveTab('profile');
    setEditMode(false);
  };

  const handleToggleStatus = async (tutor: Tutor, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tbl_users')
        .update({ tu_is_active: !currentStatus })
        .eq('tu_id', tutor.tu_id);

      if (error) throw error;

      notification.showSuccess(
        'Status Updated',
        `Tutor ${tutor.tbl_user_profiles?.tup_first_name || 'account'} has been ${!currentStatus ? 'activated' : 'deactivated'}`
      );

      loadTutors();
    } catch (error) {
      console.error('Failed to update tutor status:', error);
      notification.showError('Update Failed', 'Failed to update tutor status');
    }
  };

  const handleVerifyTutor = async (tutor: Tutor) => {
    try {
      const { error } = await supabase
        .from('tbl_tutors')
        .update({ tt_is_verified: true })
        .eq('tt_user_id', tutor.tu_id);

      if (error) throw error;

      notification.showSuccess('Tutor Verified', 'Tutor has been verified successfully');
      loadTutors();
    } catch (error) {
      console.error('Failed to verify tutor:', error);
      notification.showError('Verification Failed', 'Failed to verify tutor');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Tutors</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadTutors}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (showTutorDetails && selectedTutor) {
    return (
      <TutorDetails
        tutor={selectedTutor}
        onBack={() => {
          setShowTutorDetails(false);
          setSelectedTutor(null);
          setEditMode(false);
        }}
        onUpdate={loadTutors}
        editMode={editMode}
        setEditMode={setEditMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tutor Management</h3>
              <p className="text-gray-600">Manage tutor profiles and teaching activities</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total: {tutors.length} tutors
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Search by name, email, or specialization..."
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tutors List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tutor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teaching Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTutors.map((tutor) => (
              <tr key={tutor.tu_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {tutor.tbl_user_profiles?.tup_first_name?.charAt(0) || 'T'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {tutor.tbl_user_profiles?.tup_first_name} {tutor.tbl_user_profiles?.tup_last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{tutor.tbl_user_profiles?.tup_username}
                      </div>
                      <div className="text-xs text-gray-400">
                        {tutor.tbl_tutors?.tt_experience_years || 0} years exp.
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{tutor.tu_email}</div>
                  <div className="text-sm text-gray-500">{tutor.tbl_user_profiles?.tup_mobile}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ${tutor.tbl_tutors?.tt_hourly_rate || 0}/hour
                  </div>
                  <div className="text-sm text-gray-500">
                    {tutor.tbl_tutors?.tt_total_students || 0} students
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tutor.tbl_tutors?.tt_specializations?.slice(0, 2).map((spec, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {spec}
                      </span>
                    ))}
                    {(tutor.tbl_tutors?.tt_specializations?.length || 0) > 2 && (
                      <span className="text-xs text-gray-500">
                        +{(tutor.tbl_tutors?.tt_specializations?.length || 0) - 2} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{tutor.tbl_tutors?.tt_rating || 0}</span>
                    <span className="text-xs text-gray-500">
                      ({tutor.tbl_tutors?.tt_total_reviews || 0})
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    tutor.tbl_tutors?.tt_is_verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tutor.tbl_tutors?.tt_is_verified ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    tutor.tu_is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tutor.tu_is_active ? (
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
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(tutor.tu_created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewTutor(tutor)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {!tutor.tbl_tutors?.tt_is_verified && (
                      <button
                        onClick={() => handleVerifyTutor(tutor)}
                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                        title="Verify Tutor"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleStatus(tutor, tutor.tu_is_active)}
                      className={`p-1 rounded ${
                        tutor.tu_is_active
                          ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                      }`}
                      title={tutor.tu_is_active ? 'Deactivate' : 'Activate'}
                    >
                      {tutor.tu_is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTutors.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || verificationFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'No tutors have registered yet'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Tutor Details Component
const TutorDetails: React.FC<{
  tutor: Tutor;
  onBack: () => void;
  onUpdate: () => void;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ tutor, onBack, onUpdate, editMode, setEditMode, activeTab, setActiveTab }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    first_name: tutor.tbl_user_profiles?.tup_first_name || '',
    last_name: tutor.tbl_user_profiles?.tup_last_name || '',
    username: tutor.tbl_user_profiles?.tup_username || '',
    mobile: tutor.tbl_user_profiles?.tup_mobile || '',
    gender: tutor.tbl_user_profiles?.tup_gender || '',
    bio: tutor.tbl_tutors?.tt_bio || '',
    hourly_rate: tutor.tbl_tutors?.tt_hourly_rate || 0,
    education: tutor.tbl_tutors?.tt_education || '',
    email: tutor.tu_email,
    is_active: tutor.tu_is_active,
    is_verified: tutor.tbl_tutors?.tt_is_verified || false
  });
  const notification = useNotification();

  useEffect(() => {
    if (activeTab === 'students') {
      loadAssignments();
    }
  }, [activeTab]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const { data: assignments, error } = await supabase
        .from('tbl_tutor_assignments')
        .select(`
          tta_id,
          tta_assignment_date,
          tta_status,
          tbl_users!tta_learner_id (
            tbl_user_profiles (
              tup_first_name,
              tup_last_name
            )
          ),
          tbl_courses (
            tc_title
          )
        `)
        .eq('tta_tutor_id', tutor.tbl_tutors?.tt_id)
        .order('tta_assignment_date', { ascending: false });

      if (error) throw error;
      setAssignments(assignments || []);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      // Update tbl_users table
      const { error: userError } = await supabase
        .from('tbl_users')
        .update({
          tu_email: editData.email,
          tu_is_active: editData.is_active
        })
        .eq('tu_id', tutor.tu_id);

      if (userError) throw userError;

      // Update tbl_user_profiles table
      const { error: profileError } = await supabase
        .from('tbl_user_profiles')
        .update({
          tup_first_name: editData.first_name,
          tup_last_name: editData.last_name,
          tup_username: editData.username,
          tup_mobile: editData.mobile,
          tup_gender: editData.gender
        })
        .eq('tup_user_id', tutor.tu_id);

      if (profileError) throw profileError;

      // Update tbl_tutors table
      const { error: tutorError } = await supabase
        .from('tbl_tutors')
        .update({
          tt_bio: editData.bio,
          tt_hourly_rate: editData.hourly_rate,
          tt_education: editData.education,
          tt_is_verified: editData.is_verified
        })
        .eq('tt_user_id', tutor.tu_id);

      if (tutorError) throw tutorError;

      notification.showSuccess('Tutor Updated', 'Tutor information has been updated successfully');
      setEditMode(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update tutor:', error);
      notification.showError('Update Failed', 'Failed to update tutor information');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Details', icon: User },
    { id: 'students', label: 'Assigned Students', icon: Users },
    { id: 'performance', label: 'Teaching Performance', icon: TrendingUp }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Tutors</span>
            </button>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {tutor.tbl_user_profiles?.tup_first_name} {tutor.tbl_user_profiles?.tup_last_name}
              </h3>
              <p className="text-gray-600">Tutor Details & Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {activeTab === 'profile' && (
              <>
                {editMode ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Tutor</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
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
      </div>

      <div className="p-6">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">First Name</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editData.first_name}
                          onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{tutor.tbl_user_profiles?.tup_first_name || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Name</label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editData.last_name}
                          onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">{tutor.tbl_user_profiles?.tup_last_name || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bio</label>
                    {editMode ? (
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">{tutor.tbl_tutors?.tt_bio || 'No bio provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Hourly Rate</label>
                    {editMode ? (
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editData.hourly_rate}
                          onChange={(e) => setEditData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 mt-1">${tutor.tbl_tutors?.tt_hourly_rate || 0}/hour</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Professional Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience</label>
                    <p className="text-gray-900 mt-1">{tutor.tbl_tutors?.tt_experience_years || 0} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Education</label>
                    {editMode ? (
                      <textarea
                        value={editData.education}
                        onChange={(e) => setEditData(prev => ({ ...prev, education: e.target.value }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-900 mt-1">{tutor.tbl_tutors?.tt_education || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Specializations</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {tutor.tbl_tutors?.tt_specializations?.map((spec, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {spec}
                        </span>
                      )) || <span className="text-gray-500 text-sm">No specializations listed</span>}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Verification Status</label>
                    {editMode ? (
                      <label className="relative inline-flex items-center cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={editData.is_verified}
                          onChange={(e) => setEditData(prev => ({ ...prev, is_verified: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        <span className="ml-3 text-sm text-gray-700">Verified Tutor</span>
                      </label>
                    ) : (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                        tutor.tbl_tutors?.tt_is_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tutor.tbl_tutors?.tt_is_verified ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 mr-1" />
                            Pending Verification
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Assigned Students
              </h4>
              <div className="text-sm text-gray-500">
                Total: {assignments.length} assignments
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading assignments...</p>
              </div>
            ) : assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.tta_id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {assignment.tbl_users?.tbl_user_profiles?.tup_first_name} {assignment.tbl_users?.tbl_user_profiles?.tup_last_name}
                            </h5>
                            <p className="text-sm text-gray-500">
                              Course: {assignment.tbl_courses?.tc_title}
                            </p>
                            <p className="text-sm text-gray-500">
                              Assigned: {new Date(assignment.tta_assignment_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          assignment.tta_status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : assignment.tta_status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {assignment.tta_status.charAt(0).toUpperCase() + assignment.tta_status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students assigned</h3>
                <p className="text-gray-600">This tutor hasn't been assigned any students yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Teaching Performance
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{tutor.tbl_tutors?.tt_total_students || 0}</div>
                <div className="text-sm text-green-600">Total Students</div>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <div className="text-2xl font-bold text-yellow-600">{tutor.tbl_tutors?.tt_rating || 0}</div>
                </div>
                <div className="text-sm text-yellow-600">Average Rating</div>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{tutor.tbl_tutors?.tt_total_reviews || 0}</div>
                <div className="text-sm text-blue-600">Total Reviews</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">${tutor.tbl_tutors?.tt_hourly_rate || 0}</div>
                <div className="text-sm text-purple-600">Hourly Rate</div>
              </div>
            </div>

            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-8 w-8 mx-auto mb-2" />
              <p>Detailed teaching analytics will be displayed here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorManagement;