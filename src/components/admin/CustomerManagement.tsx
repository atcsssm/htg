import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../ui/NotificationProvider';
import {
    Users,
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
    DollarSign,
    ArrowLeft,
    Save,
    X,
    CheckCircle,
    AlertCircle,
    CreditCard,
    User,
    Settings
} from 'lucide-react';

interface Customer {
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
        tup_sponsorship_number: string;
        tup_gender: string;
    } | null;
}

interface Transaction {
    id: string;
    amount: number;
    currency: string;
    payment_method: string;
    payment_status: string;
    created_at: string;
    subscription_plan?: {
        name: string;
    };
}

const CustomerManagement: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [verificationFilter, setVerificationFilter] = useState('all');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showCustomerDetails, setShowCustomerDetails] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const notification = useNotification();

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔍 Loading customers from database...');

            // Use the correct table structure with tbl_ prefix
            try {
                const { data: customers, error } = await supabase
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
                          tup_sponsorship_number,
                          tup_parent_account,
                          tup_created_at,
                          tup_updated_at
                        )
                      `)
                    .eq('tu_user_type', 'customer')
                    .order('tu_created_at', { ascending: false });

                if (error) {
                    console.error('❌ Failed to load customers:', error);
                    throw error;
                }

                console.log('✅ Customers loaded:', customers);
                setCustomers(customers || []);
            } catch (dbError) {
                console.error('❌ Database error:', dbError);
                setError('Failed to load customers. Please check your database connection.');
            }
        } catch (error) {
            console.error('❌ Failed to load customers:', error);
            setError('Failed to load customers. Please try again.');
            notification.showError('Load Failed', 'Failed to load customer data from database');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch =
            (customer.tu_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (customer.tbl_user_profiles?.tup_first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (customer.tbl_user_profiles?.tup_last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (customer.tbl_user_profiles?.tup_username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (customer.tbl_user_profiles?.tup_sponsorship_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && customer.tu_is_active) ||
            (statusFilter === 'inactive' && !customer.tu_is_active);

        const matchesVerification =
            verificationFilter === 'all' ||
            (verificationFilter === 'verified' && customer.tu_is_verified) ||
            (verificationFilter === 'unverified' && !customer.tu_is_verified);

        return matchesSearch && matchesStatus && matchesVerification;
    });


    const handleViewCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowCustomerDetails(true);
        setActiveTab('profile');
        setEditMode(false);
    };

    const handleToggleStatus = async (customer: Customer, currentStatus: boolean) => {
        try {
            // Try new structure first
            let { error } = await supabase
                .from('users')
                .update({ is_active: !currentStatus })
                .eq('id', customer.tu_id);

            // If new structure fails, try old structure
            if (error && error.message.includes('relation "users" does not exist')) {
                const { error: oldError } = await supabase
                    .from('tbl_users')
                    .update({ tu_is_active: !currentStatus })
                    .eq('tu_id', customer.tu_id);

                if (oldError) throw oldError;
            } else if (error) {
                throw error;
            }

            notification.showSuccess(
                'Status Updated',
                `Customer ${customer.tbl_user_profiles?.tup_first_name || 'account'} has been ${!currentStatus ? 'activated' : 'deactivated'}`
            );

            // Reload customers
            loadCustomers();
        } catch (error) {
            console.error('Failed to update customer status:', error);
            notification.showError('Update Failed', 'Failed to update customer status');
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
                    <Users className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Customers</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadCustomers}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                    >
                        <Users className="h-4 w-4" />
                        <span>Retry</span>
                    </button>
                </div>
            </div>
        );
    }

    if (showCustomerDetails && selectedCustomer) {
        return (
            <CustomerDetails
                customer={selectedCustomer}
                onBack={() => {
                    setShowCustomerDetails(false);
                    setSelectedCustomer(null);
                    setEditMode(false);
                }}
                onUpdate={loadCustomers}
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
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Customer Management</h3>
                            <p className="text-gray-600">Manage and monitor customer accounts</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500">
                        Total: {customers.length} customers
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
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Search by name, email, username, or sponsorship number..."
                            />
                        </div>
                    </div>

                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Verification</option>
                            <option value="verified">Verified</option>
                            <option value="unverified">Unverified</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Customer List */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
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
                    {filteredCustomers.map((customer) => (
                        <tr key={customer.tu_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {customer.tbl_user_profiles?.tup_first_name?.charAt(0) || 'U'}
                        </span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {customer.tbl_user_profiles?.tup_first_name} {customer.tbl_user_profiles?.tup_last_name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            @{customer.tbl_user_profiles?.tup_username}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {customer.tbl_user_profiles?.tup_sponsorship_number}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{customer.tu_email}</div>
                                <div className="text-sm text-gray-500">{customer.tbl_user_profiles?.tup_mobile}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        customer.tu_email_verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}>
                      <Mail className="h-3 w-3 mr-1" />
                        {customer.tu_email_verified ? 'Email ✓' : 'Email ✗'}
                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        customer.tu_mobile_verified
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                      <Phone className="h-3 w-3 mr-1" />
                                        {customer.tu_mobile_verified ? 'Mobile ✓' : 'Mobile ✗'}
                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      customer.tu_is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.tu_is_active ? (
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
                                    {new Date(customer.tu_created_at).toLocaleDateString()}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleViewCustomer(customer)}
                                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                        title="View Details"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(customer, customer.tu_is_active)}
                                        className={`p-1 rounded ${
                                            customer.tu_is_active
                                                ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                        }`}
                                        title={customer.tu_is_active ? 'Deactivate' : 'Activate'}
                                    >
                                        {customer.tu_is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                    <p className="text-gray-600">
                        {searchTerm || statusFilter !== 'all' || verificationFilter !== 'all'
                            ? 'Try adjusting your search criteria'
                            : 'No customers have registered yet'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

// Customer Details Component with Sub-sections
const CustomerDetails: React.FC<{
    customer: Customer;
    onBack: () => void;
    onUpdate: () => void;
    editMode: boolean;
    setEditMode: (mode: boolean) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}> = ({ customer, onBack, onUpdate, editMode, setEditMode, activeTab, setActiveTab }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [editData, setEditData] = useState({
        first_name: customer.tbl_user_profiles?.tup_first_name || '',
        last_name: customer.tbl_user_profiles?.tup_last_name || '',
        username: customer.tbl_user_profiles?.tup_username || '',
        mobile: customer.tbl_user_profiles?.tup_mobile || '',
        gender: customer.tbl_user_profiles?.tup_gender || '',
        email: customer.tu_email,
        is_active: customer.tu_is_active,
        email_verified: customer.tu_email_verified,
        mobile_verified: customer.tu_mobile_verified
    });
    const notification = useNotification();

    useEffect(() => {
        if (activeTab === 'transactions') {
            loadTransactions();
        }
    }, [activeTab]);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const { data: payments, error } = await supabase
                .from('tbl_payments')
                .select(`
          tp_id,
          tp_amount,
          tp_currency,
          tp_payment_method,
          tp_payment_status,
          tp_transaction_id,
          tp_created_at,
          tbl_subscription_plans (
            tsp_name,
            tsp_price
          )
        `)
                .eq('tp_user_id', customer.tu_id)
                .order('tp_created_at', { ascending: false });

            if (error) throw error;
            setTransactions(payments || []);
        } catch (error) {
            console.error('Failed to load payments:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!customer || !editData) return;

        try {
            // Update tbl_users table
            const { error: userError } = await supabase
                .from('tbl_users')
                .update({
                    tu_email: editData.email,
                    tu_is_verified: editData.isVerified,
                    tu_email_verified: editData.emailVerified,
                    tu_mobile_verified: editData.mobileVerified,
                    tu_is_active: editData.isActive
                })
                .eq('tu_id', customer.tu_id);

            if (userError) throw userError;

            // Update tbl_user_profiles table
            const { error: profileError } = await supabase
                .from('tbl_user_profiles')
                .update({
                    tup_first_name: editData.firstName,
                    tup_last_name: editData.lastName,
                    tup_username: editData.username,
                    tup_mobile: editData.mobile,
                    tup_gender: editData.gender
                })
                .eq('tup_user_id', customer.tu_id);

            if (profileError) throw profileError;

            notification.showSuccess('Customer Updated', 'Customer information has been updated successfully');
            setEditMode(false);
            onUpdate();
        } catch (error) {
            console.error('Failed to update customer:', error);
            notification.showError('Update Failed', 'Failed to update customer information');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Details', icon: User },
        { id: 'transactions', label: 'Payment Transactions', icon: CreditCard }
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
                            <span>Back to Customers</span>
                        </button>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {customer.tbl_user_profiles?.tup_first_name} {customer.tbl_user_profiles?.tup_last_name}
                            </h3>
                            <p className="text-gray-600">Customer Details & Management</p>
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
                                        <span>Edit Customer</span>
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
                                        ? 'border-blue-500 text-blue-600'
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
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="text-gray-900 mt-1">{customer.tbl_user_profiles?.tup_first_name || 'Not provided'}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Last Name</label>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={editData.last_name}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="text-gray-900 mt-1">{customer.tbl_user_profiles?.tup_last_name || 'Not provided'}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Username</label>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                value={editData.username}
                                                onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900 mt-1">@{customer.tbl_user_profiles?.tup_username || 'Not set'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        {editMode ? (
                                            <input
                                                type="email"
                                                value={editData.email}
                                                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900 mt-1">{customer.tu_email}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Mobile</label>
                                        {editMode ? (
                                            <input
                                                type="tel"
                                                value={editData.mobile}
                                                onChange={(e) => setEditData(prev => ({ ...prev, mobile: e.target.value }))}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <p className="text-gray-900 mt-1">{customer.tbl_user_profiles?.tup_mobile || 'Not provided'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Gender</label>
                                        {editMode ? (
                                            <select
                                                value={editData.gender}
                                                onChange={(e) => setEditData(prev => ({ ...prev, gender: e.target.value }))}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">Select gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        ) : (
                                            <p className="text-gray-900 mt-1 capitalize">{customer.tbl_user_profiles?.tup_gender || 'Not specified'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                                    <Settings className="h-5 w-5 mr-2" />
                                    Account Information
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Sponsorship Number</label>
                                        <p className="text-gray-900 mt-1 font-mono text-lg">{customer.tbl_user_profiles?.tup_sponsorship_number}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Registration Date</label>
                                        <p className="text-gray-900 mt-1">{new Date(customer.tu_created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Account Status</label>
                                        {editMode ? (
                                            <select
                                                value={editData.is_active ? 'active' : 'inactive'}
                                                onChange={(e) => setEditData(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                                                customer.tu_is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {customer.tu_is_active ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="h-4 w-4 mr-1" />
                                                        Inactive
                                                    </>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Verification Status</label>
                                        <div className="space-y-2 mt-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Email Verification</span>
                                                {editMode ? (
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={editData.email_verified}
                                                            onChange={(e) => setEditData(prev => ({ ...prev, email_verified: e.target.checked }))}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                ) : (
                                                    <span className={`w-2 h-2 rounded-full ${customer.tu_email_verified ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Mobile Verification</span>
                                                {editMode ? (
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={editData.mobile_verified}
                                                            onChange={(e) => setEditData(prev => ({ ...prev, mobile_verified: e.target.checked }))}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                ) : (
                                                    <span className={`w-2 h-2 rounded-full ${customer.tu_mobile_verified ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-medium text-gray-900 flex items-center">
                                <CreditCard className="h-5 w-5 mr-2" />
                                Payment Transaction History
                            </h4>
                            <div className="text-sm text-gray-500">
                                Total: {transactions.length} transactions
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Loading transactions...</p>
                            </div>
                        ) : transactions.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.map((transaction) => (
                                    <div key={transaction.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <div className="bg-blue-100 p-2 rounded-lg">
                                                        <CreditCard className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-medium text-gray-900">
                                                            {transaction.subscription_plan?.name || 'Payment'}
                                                        </h5>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(transaction.created_at).toLocaleDateString()} at {new Date(transaction.created_at).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                    <div>
                                                        <span className="text-xs font-medium text-gray-500">Payment Method</span>
                                                        <p className="text-sm text-gray-900 capitalize">{transaction.payment_method}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-medium text-gray-500">Currency</span>
                                                        <p className="text-sm text-gray-900">{transaction.currency}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right ml-6">
                                                <p className="text-2xl font-bold text-gray-900">
                                                    ${transaction.amount}
                                                </p>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                    transaction.payment_status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : transaction.payment_status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : transaction.payment_status === 'failed'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {transaction.payment_status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                    {transaction.payment_status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                                                    {transaction.payment_status.charAt(0).toUpperCase() + transaction.payment_status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                                <p className="text-gray-600">This customer hasn't made any payments yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerManagement;