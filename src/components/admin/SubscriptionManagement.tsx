import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../ui/NotificationProvider';
import {
  CreditCard,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  Clock
} from 'lucide-react';

interface SubscriptionPlan {
  tsp_id: string;
  tsp_name: string;
  tsp_description: string;
  tsp_price: number;
  tsp_duration_days: number;
  tsp_features: string[];
  tsp_is_active: boolean;
  tsp_created_at: string;
  tsp_updated_at: string;
  subscriber_count?: number;
}

interface UserSubscription {
  tus_id: string;
  tus_status: string;
  tus_start_date: string;
  tus_end_date: string;
  tus_payment_amount: number;
  tbl_users: {
    tu_email: string;
    tbl_user_profiles: {
      tup_first_name: string;
      tup_last_name: string;
    };
  };
  tbl_subscription_plans: {
    tsp_name: string;
  };
}

const SubscriptionManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [activeTab, setActiveTab] = useState('plans');
  const notification = useNotification();

  const [planFormData, setPlanFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration_days: 30,
    features: [] as string[],
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([loadPlans(), loadSubscriptions()]);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      setError('Failed to load subscription data');
      notification.showError('Load Failed', 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_subscription_plans')
        .select(`
          *,
          tbl_user_subscriptions(count)
        `)
        .order('tsp_created_at', { ascending: false });

      if (error) throw error;

      const processedPlans = data?.map(plan => ({
        ...plan,
        subscriber_count: plan.tbl_user_subscriptions?.length || 0
      })) || [];

      setPlans(processedPlans);
    } catch (error) {
      console.error('Failed to load plans:', error);
      setPlans([]);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_user_subscriptions')
        .select(`
          *,
          tbl_users (
            tu_email,
            tbl_user_profiles (
              tup_first_name,
              tup_last_name
            )
          ),
          tbl_subscription_plans (
            tsp_name
          )
        `)
        .order('tus_created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      setSubscriptions([]);
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && selectedPlan) {
        const { error } = await supabase
          .from('tbl_subscription_plans')
          .update({
            tsp_name: planFormData.name,
            tsp_description: planFormData.description,
            tsp_price: planFormData.price,
            tsp_duration_days: planFormData.duration_days,
            tsp_features: planFormData.features,
            tsp_is_active: planFormData.is_active
          })
          .eq('tsp_id', selectedPlan.tsp_id);

        if (error) throw error;
        notification.showSuccess('Plan Updated', 'Subscription plan updated successfully');
      } else {
        const { error } = await supabase
          .from('tbl_subscription_plans')
          .insert({
            tsp_name: planFormData.name,
            tsp_description: planFormData.description,
            tsp_price: planFormData.price,
            tsp_duration_days: planFormData.duration_days,
            tsp_features: planFormData.features,
            tsp_is_active: planFormData.is_active
          });

        if (error) throw error;
        notification.showSuccess('Plan Created', 'New subscription plan created successfully');
      }

      setShowPlanModal(false);
      resetPlanForm();
      loadPlans();
    } catch (error) {
      console.error('Failed to save plan:', error);
      notification.showError('Save Failed', 'Failed to save subscription plan');
    }
  };

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (confirm(`Are you sure you want to delete the plan "${planName}"? This action cannot be undone.`)) {
      try {
        const { error } = await supabase
          .from('tbl_subscription_plans')
          .delete()
          .eq('tsp_id', planId);

        if (error) throw error;
        notification.showSuccess('Plan Deleted', 'Subscription plan deleted successfully');
        loadPlans();
      } catch (error) {
        console.error('Failed to delete plan:', error);
        notification.showError('Delete Failed', 'Failed to delete subscription plan');
      }
    }
  };

  const handleToggleStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tbl_subscription_plans')
        .update({ tsp_is_active: !currentStatus })
        .eq('tsp_id', planId);

      if (error) throw error;

      notification.showSuccess(
        'Status Updated',
        `Plan has been ${!currentStatus ? 'activated' : 'deactivated'}`
      );
      loadPlans();
    } catch (error) {
      console.error('Failed to update plan status:', error);
      notification.showError('Update Failed', 'Failed to update plan status');
    }
  };

  const resetPlanForm = () => {
    setPlanFormData({
      name: '',
      description: '',
      price: 0,
      duration_days: 30,
      features: [],
      is_active: true
    });
    setEditMode(false);
    setSelectedPlan(null);
  };

  const openEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPlanFormData({
      name: plan.tsp_name,
      description: plan.tsp_description,
      price: plan.tsp_price,
      duration_days: plan.tsp_duration_days,
      features: plan.tsp_features,
      is_active: plan.tsp_is_active
    });
    setEditMode(true);
    setShowPlanModal(true);
  };

  const addFeature = () => {
    setPlanFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setPlanFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index: number) => {
    setPlanFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = 
      plan.tsp_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.tsp_description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && plan.tsp_is_active) ||
      (statusFilter === 'inactive' && !plan.tsp_is_active);

    return matchesSearch && matchesStatus;
  });

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.tbl_users?.tu_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.tbl_users?.tbl_user_profiles?.tup_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.tbl_users?.tbl_user_profiles?.tup_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.tbl_subscription_plans?.tsp_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && subscription.tus_status === 'active') ||
      (statusFilter === 'expired' && subscription.tus_status === 'expired') ||
      (statusFilter === 'cancelled' && subscription.tus_status === 'cancelled');

    return matchesSearch && matchesStatus;
  });

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
          <CreditCard className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Subscription Management</h3>
              <p className="text-gray-600">Manage subscription plans and user subscriptions</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {activeTab === 'plans' && (
              <button
                onClick={() => {
                  resetPlanForm();
                  setShowPlanModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Plan</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'plans'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Subscription Plans</span>
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subscriptions'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>User Subscriptions</span>
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
                placeholder={activeTab === 'plans' ? 'Search plans...' : 'Search subscriptions...'}
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {activeTab === 'plans' ? (
                <>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </>
              ) : (
                <>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'plans' && (
          <div>
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <div key={plan.tsp_id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900">{plan.tsp_name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        plan.tsp_is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {plan.tsp_is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">${plan.tsp_price}</div>
                    <div className="text-sm text-gray-600">per {plan.tsp_duration_days} days</div>
                  </div>

                  <p className="text-gray-600 mb-4">{plan.tsp_description}</p>

                  <div className="space-y-2 mb-6">
                    {plan.tsp_features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{plan.subscriber_count || 0} subscribers</span>
                    <span>Created {new Date(plan.tsp_created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditPlan(plan)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(plan.tsp_id, plan.tsp_is_active)}
                      className={`flex-1 py-2 px-3 rounded-lg transition-colors text-sm font-medium ${
                        plan.tsp_is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {plan.tsp_is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.tsp_id, plan.tsp_name)}
                      className="bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPlans.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search criteria'
                    : 'No subscription plans have been created yet'
                  }
                </p>
                <button
                  onClick={() => {
                    resetPlanForm();
                    setShowPlanModal(true);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create First Plan
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div>
            {/* Subscriptions Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscriptions.map((subscription) => (
                    <tr key={subscription.tus_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {subscription.tbl_users?.tbl_user_profiles?.tup_first_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {subscription.tbl_users?.tbl_user_profiles?.tup_first_name} {subscription.tbl_users?.tbl_user_profiles?.tup_last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {subscription.tbl_users?.tu_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.tbl_subscription_plans?.tsp_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${subscription.tus_payment_amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(subscription.tus_start_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {new Date(subscription.tus_end_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          subscription.tus_status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : subscription.tus_status === 'expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {subscription.tus_status.charAt(0).toUpperCase() + subscription.tus_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSubscriptions.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search criteria'
                    : 'No user subscriptions found'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editMode ? 'Edit Subscription Plan' : 'Add New Subscription Plan'}
                </h3>
                <button
                  onClick={() => {
                    setShowPlanModal(false);
                    resetPlanForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSavePlan} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={planFormData.name}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Basic Plan, Premium Plan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={planFormData.description}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief description of the plan"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={planFormData.price}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Days) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="1"
                      required
                      value={planFormData.duration_days}
                      onChange={(e) => setPlanFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 30 }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Features
                  </label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    + Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {planFormData.features.map((feature, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Plan feature"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {planFormData.features.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No features added yet</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={planFormData.is_active}
                  onChange={(e) => setPlanFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active Plan</span>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanModal(false);
                    resetPlanForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editMode ? 'Update Plan' : 'Create Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;