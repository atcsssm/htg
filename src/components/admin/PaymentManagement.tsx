import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../ui/NotificationProvider';
import {
  DollarSign,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  RefreshCw,
  TrendingUp,
  Users,
  ArrowLeft,
  FileText
} from 'lucide-react';

interface Payment {
  tp_id: string;
  tp_amount: number;
  tp_currency: string;
  tp_payment_method: string;
  tp_payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  tp_transaction_id: string;
  tp_gateway_response: any;
  tp_created_at: string;
  tp_updated_at: string;
  tbl_users: {
    tu_email: string;
    tbl_user_profiles: {
      tup_first_name: string;
      tup_last_name: string;
    };
  };
  tbl_user_subscriptions: {
    tbl_subscription_plans: {
      tsp_name: string;
    };
  };
}

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  refundedPayments: number;
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalTransactions: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    refundedPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const notification = useNotification();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading payments from database...');

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('tbl_payments')
        .select(`
          *,
          tbl_users (
            tu_email,
            tbl_user_profiles (
              tup_first_name,
              tup_last_name
            )
          ),
          tbl_user_subscriptions (
            tbl_subscription_plans (
              tsp_name
            )
          )
        `)
        .order('tp_created_at', { ascending: false })
        .limit(100);

      if (paymentsError) {
        console.error('❌ Failed to load payments:', paymentsError);
        throw paymentsError;
      }

      console.log('✅ Payments loaded:', paymentsData);
      setPayments(paymentsData || []);

      // Calculate stats
      const paymentStats = calculateStats(paymentsData || []);
      setStats(paymentStats);

    } catch (error) {
      console.error('❌ Failed to load payments:', error);
      setError('Failed to load payment data');
      notification.showError('Load Failed', 'Failed to load payment data from database');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData: Payment[]): PaymentStats => {
    const stats = {
      totalRevenue: 0,
      totalTransactions: paymentsData.length,
      successfulPayments: 0,
      failedPayments: 0,
      pendingPayments: 0,
      refundedPayments: 0
    };

    paymentsData.forEach(payment => {
      if (payment.tp_payment_status === 'completed') {
        stats.totalRevenue += payment.tp_amount;
        stats.successfulPayments++;
      } else if (payment.tp_payment_status === 'failed') {
        stats.failedPayments++;
      } else if (payment.tp_payment_status === 'pending') {
        stats.pendingPayments++;
      } else if (payment.tp_payment_status === 'refunded') {
        stats.refundedPayments++;
      }
    });

    return stats;
  };

  const getDateRange = (filter: string) => {
    const now = new Date();
    const startDate = new Date();

    switch (filter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return null;
    }

    return { start: startDate, end: now };
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.tbl_users?.tu_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tbl_users?.tbl_user_profiles?.tup_first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tbl_users?.tbl_user_profiles?.tup_last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tp_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tbl_user_subscriptions?.tbl_subscription_plans?.tsp_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || payment.tp_payment_status === statusFilter;

    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      const dateRange = getDateRange(dateFilter);
      if (!dateRange) return true;
      const paymentDate = new Date(payment.tp_created_at);
      return paymentDate >= dateRange.start && paymentDate <= dateRange.end;
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const handleRefundPayment = async (paymentId: string) => {
    if (confirm('Are you sure you want to process a refund for this payment? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('tbl_payments')
          .update({ 
            tp_payment_status: 'refunded',
            tp_updated_at: new Date().toISOString()
          })
          .eq('tp_id', paymentId);

        if (error) throw error;

        notification.showSuccess('Refund Processed', 'Payment has been refunded successfully');
        loadPayments();
      } catch (error) {
        console.error('Failed to process refund:', error);
        notification.showError('Refund Failed', 'Failed to process refund');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
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
          <DollarSign className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Payments</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadPayments}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (showPaymentDetails && selectedPayment) {
    return (
      <PaymentDetails
        payment={selectedPayment}
        onBack={() => {
          setShowPaymentDetails(false);
          setSelectedPayment(null);
        }}
        onRefund={handleRefundPayment}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Management</h3>
              <p className="text-gray-600">Monitor transactions and payment analytics</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total: {payments.length} transactions
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Successful</p>
                <p className="text-2xl font-bold text-blue-900">{stats.successfulPayments}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pendingPayments}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Failed</p>
                <p className="text-2xl font-bold text-red-900">{stats.failedPayments}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
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
                placeholder="Search by user, email, transaction ID, or plan..."
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction
              </th>
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
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <tr key={payment.tp_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {payment.tp_transaction_id || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    ID: {payment.tp_id.slice(0, 8)}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {payment.tbl_users?.tbl_user_profiles?.tup_first_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.tbl_users?.tbl_user_profiles?.tup_first_name} {payment.tbl_users?.tbl_user_profiles?.tup_last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.tbl_users?.tu_email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {payment.tbl_user_subscriptions?.tbl_subscription_plans?.tsp_name || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${payment.tp_amount}
                  </div>
                  <div className="text-sm text-gray-500">
                    {payment.tp_currency}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 capitalize">
                    {payment.tp_payment_method}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.tp_payment_status)}`}>
                    {getStatusIcon(payment.tp_payment_status)}
                    <span className="ml-1 capitalize">{payment.tp_payment_status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(payment.tp_created_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(payment.tp_created_at).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewPayment(payment)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {payment.tp_payment_status === 'completed' && (
                      <button
                        onClick={() => handleRefundPayment(payment.tp_id)}
                        className="text-orange-600 hover:text-orange-800 p-1 rounded hover:bg-orange-50"
                        title="Process Refund"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'No payment transactions found'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Payment Details Component
const PaymentDetails: React.FC<{
  payment: Payment;
  onBack: () => void;
  onRefund: (paymentId: string) => void;
}> = ({ payment, onBack, onRefund }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Payments</span>
            </button>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              <p className="text-gray-600">Transaction ID: {payment.tp_transaction_id || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {payment.tp_payment_status === 'completed' && (
              <button
                onClick={() => onRefund(payment.tp_id)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Process Refund</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Information */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-2xl font-bold text-gray-900">${payment.tp_amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Currency</label>
                  <p className="text-gray-900">{payment.tp_currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="text-gray-900 capitalize">{payment.tp_payment_method}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.tp_payment_status)}`}>
                    {getStatusIcon(payment.tp_payment_status)}
                    <span className="ml-1 capitalize">{payment.tp_payment_status}</span>
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                  <p className="text-gray-900 font-mono text-sm">{payment.tp_transaction_id || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Customer Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">
                    {payment.tbl_users?.tbl_user_profiles?.tup_first_name} {payment.tbl_users?.tbl_user_profiles?.tup_last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{payment.tbl_users?.tu_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Subscription Plan</label>
                  <p className="text-gray-900">{payment.tbl_user_subscriptions?.tbl_subscription_plans?.tsp_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Date</label>
                  <p className="text-gray-900">
                    {new Date(payment.tp_created_at).toLocaleDateString()} at {new Date(payment.tp_created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Gateway Response */}
            {payment.tp_gateway_response && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Gateway Response
                </h4>
                <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-auto max-h-40">
                  {JSON.stringify(payment.tp_gateway_response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;