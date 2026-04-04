import { useState, useEffect } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";

export default function StudentPayments({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    fetchUserData();
    fetchPayments();
    fetchStats();
  }, [filterMonth, filterYear]);

  const fetchUserData = async () => {
    try {
      const res = await API.get("/user/me");
      setUser(res.data);
    } catch (error) {
      console.error("Failed to fetch user data");
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await API.get("/payments/student", {
        params: {
          month: filterMonth,
          year: filterYear
        }
      });
      setPayments(response.data.payments || []);
    } catch (error) {
      toast.error("Failed to fetch payment records");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get("/payments/stats");
      setStats(response.data.summary || {});
    } catch (error) {
      console.error("Failed to fetch payment stats");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
      failed: "bg-red-100 text-red-800",
      processing: "bg-blue-100 text-blue-800"
    };
    return colors[status] || colors.pending;
  };

  const getTypeColor = (type) => {
    const colors = {
      monthly_fee: "bg-blue-100 text-blue-700",
      penalty: "bg-red-100 text-red-700",
      refund: "bg-green-100 text-green-700",
      extra_leave: "bg-orange-100 text-orange-700"
    };
    return colors[type] || colors.monthly_fee;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(amount);
  };

  const getTypeLabel = (type) => {
    const labels = {
      monthly_fee: "Monthly Tuition Fee",
      penalty: "Penalty",
      refund: "Refund",
      extra_leave: "Extra Leave Charges"
    };
    return labels[type] || type;
  };

  const sortedPayments = () => {
    const sorted = [...payments];
    if (sortBy === "date") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "amount") {
      sorted.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "status") {
      sorted.sort((a, b) => a.status.localeCompare(b.status));
    }
    return sorted;
  };

  const getTotalAmount = () => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const getCompletedAmount = () => {
    return payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const getPendingAmount = () => {
    return payments
      .filter((p) =>
        ["pending", "processing", "overdue"].includes(p.status)
      )
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} user={user} />
        <div className="flex-1 p-8">
          <Loader message="Loading payment details..." />
        </div>
      </div>
    );
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} user={user} />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Monthly Payments
            </h1>
            <p className="text-gray-600">
              Track your tuition fees and payment history
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(getTotalAmount())}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Amount</div>
              <div className="text-xs text-gray-500 mt-2">
                {filterMonth && months[filterMonth - 1]} {filterYear}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(getCompletedAmount())}
              </div>
              <div className="text-sm text-gray-600 mt-1">Paid</div>
              <div className="text-xs text-green-500 mt-2">✓ Completed</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <div className="text-3xl font-bold text-yellow-600">
                {formatCurrency(getPendingAmount())}
              </div>
              <div className="text-sm text-gray-600 mt-1">Due</div>
              <div className="text-xs text-yellow-500 mt-2">⚠ Pending</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="text-3xl font-bold text-purple-600">
                {payments.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Transactions</div>
              <div className="text-xs text-purple-500 mt-2">This Period</div>
            </div>
          </div>

          {/* Filters and Sorting */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {months.map((month, idx) => (
                    <option key={idx} value={idx + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date (Newest)</option>
                  <option value="amount">Amount (Highest)</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  &nbsp;
                </label>
                <button
                  onClick={fetchPayments}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment History
              </h3>
            </div>

            {sortedPayments().length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">No payments found</p>
                <p className="text-gray-400 mt-2 text-sm">
                  No payment records for {months[filterMonth - 1]} {filterYear}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sortedPayments().map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                              payment.type
                            )}`}
                          >
                            {getTypeLabel(payment.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {payment.billingPeriod?.month ||
                              `${months[filterMonth - 1]} ${filterYear}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              payment.status
                            )}`}
                          >
                            {payment.status.charAt(0).toUpperCase() +
                              payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(payment.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.transactionId && (
                            <div className="text-xs text-gray-500 truncate">
                              ID: {payment.transactionId.slice(-8)}
                            </div>
                          )}
                          {payment.description && (
                            <div className="text-xs text-gray-500 truncate">
                              {payment.description}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Leave Deduction Info */}
          {payments.some((p) => p.leaveDays?.paidLeaveDays > 0) && (
            <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-3">
                📌 Leave Deductions
              </h3>
              <p className="text-orange-800 mb-3">
                Some of your payments include leave deductions:
              </p>
              <ul className="space-y-2 text-orange-800 text-sm">
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>
                    <strong>Free Leaves:</strong> 2 days per month without
                    deduction
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>
                    <strong>Extra Leaves:</strong> Charged at daily rate (Monthly
                    Fee ÷ 30)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">•</span>
                  <span>
                    <strong>Absence Days:</strong> Also deducted at daily rate
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* Payment Policy */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              💡 Payment Policy
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li className="flex items-start">
                <span className="mr-3">•</span>
                <span>
                  <strong>Monthly Fees:</strong> Due by the 5th of each month
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">•</span>
                <span>
                  <strong>Late Payment:</strong> Penalties applied after due
                  date
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">•</span>
                <span>
                  <strong>Payment Methods:</strong> Razorpay, Wallet, or Bank
                  Transfer
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">•</span>
                <span>
                  <strong>Refunds:</strong> Processed within 5-7 business days
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
