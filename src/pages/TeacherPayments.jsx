import { useState, useEffect } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const TeacherPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    studentId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    amount: '',
    type: 'monthly_fee',
    description: '',
    billingPeriod: `${new Date().getMonth() + 1}-${new Date().getFullYear()}`,
    penaltyReason: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      const response = await API.get('/payments/teacher', {
        params: filters
      });
      setPayments(response.data.payments);
    } catch (error) {
      toast.error("Failed to fetch payment records");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get('/payments/stats');
      setStats(response.data.summary);
    } catch (error) {
      console.error("Failed to fetch payment stats");
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      await API.post('/payments/create', paymentForm);
      toast.success("Payment created successfully");
      setShowCreatePayment(false);
      setPaymentForm({
        studentId: '',
        amount: '',
        type: 'monthly_fee',
        description: '',
        billingPeriod: `${new Date().getMonth() + 1}-${new Date().getFullYear()}`,
        penaltyReason: ''
      });
      fetchPayments();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create payment");
    }
  };

  const markAsOverdue = async (paymentId) => {
    try {
      await API.put(`/payments/${paymentId}/overdue`);
      toast.success("Payment marked as overdue");
      fetchPayments();
    } catch (error) {
      toast.error("Failed to mark payment as overdue");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'monthly_fee': return 'text-blue-600 bg-blue-100';
      case 'penalty': return 'text-red-600 bg-red-100';
      case 'refund': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <Loader message="Loading payments..." className="mx-auto" />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Management</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">₹{stats.totalReceived || 0}</div>
            <div className="text-sm text-gray-600">Total Received</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">₹{stats.totalPending || 0}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">₹{stats.totalOverdue || 0}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">₹{stats.totalOutstanding || 0}</div>
            <div className="text-sm text-gray-600">Outstanding</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreatePayment(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Payment
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="failed">Failed</option>
            </select>

            <input
              type="text"
              placeholder="Student ID"
              value={filters.studentId}
              onChange={(e) => setFilters({...filters, studentId: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />

            <select
              value={filters.month}
              onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(0, i).toLocaleString('en', {month: 'long'})}
                </option>
              ))}
            </select>

            <select
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {Array.from({length: 5}, (_, i) => (
                <option key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
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
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.student?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(payment.type)}`}>
                        {payment.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{payment.amount}
                      {payment.leaveDeductions > 0 && (
                        <span className="text-xs text-red-600 block">
                          (-₹{payment.leaveDeductions} leave deduction)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => markAsOverdue(payment._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Mark Overdue
                        </button>
                      )}
                      {payment.status === 'completed' && (
                        <span className="text-green-600">Paid</span>
                      )}
                      {payment.status === 'overdue' && (
                        <span className="text-red-600">Overdue</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No payment records found for the selected filters.
            </div>
          )}
        </div>

        {/* Create Payment Modal */}
        {showCreatePayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Create Payment</h2>
              <form onSubmit={handleCreatePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student ID</label>
                  <input
                    type="text"
                    value={paymentForm.studentId}
                    onChange={(e) => setPaymentForm({...paymentForm, studentId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={paymentForm.type}
                    onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="monthly_fee">Monthly Fee</option>
                    <option value="penalty">Penalty</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    required
                  />
                </div>

                {paymentForm.type === 'penalty' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Penalty Reason</label>
                    <input
                      type="text"
                      value={paymentForm.penaltyReason}
                      onChange={(e) => setPaymentForm({...paymentForm, penaltyReason: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Create Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreatePayment(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPayments;