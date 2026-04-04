import { useState, useEffect } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";

export default function StudentLeaveRequests({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [showRequestLeave, setShowRequestLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: "",
    endDate: "",
    reason: "other",
    description: ""
  });

  useEffect(() => {
    fetchUserData();
    fetchLeaveRequests();
    fetchLeaveBalance();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await API.get("/user/me");
      setUser(res.data);
    } catch (error) {
      console.error("Failed to fetch user data");
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await API.get("/leaves/student?limit=50");
      setLeaveRequests(response.data.leaveRequests || []);
    } catch (error) {
      toast.error("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await API.get("/leaves/student/balance");
      setLeaveBalance(response.data.balance || {});
    } catch (error) {
      console.error("Failed to fetch leave balance");
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleRequestLeave = async (e) => {
    e.preventDefault();

    if (!leaveForm.startDate || !leaveForm.endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (new Date(leaveForm.startDate) > new Date(leaveForm.endDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }

    try {
      await API.post("/leaves/student/request", leaveForm);
      toast.success("Leave request submitted successfully");
      setShowRequestLeave(false);
      setLeaveForm({
        startDate: "",
        endDate: "",
        reason: "other",
        description: ""
      });
      fetchLeaveRequests();
      fetchLeaveBalance();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit leave request"
      );
    }
  };

  const cancelLeaveRequest = async (leaveId) => {
    if (!window.confirm("Are you sure you want to cancel this leave request?")) {
      return;
    }

    try {
      await API.put(`/leaves/student/${leaveId}/cancel`);
      toast.success("Leave request cancelled");
      fetchLeaveRequests();
      fetchLeaveBalance();
    } catch (error) {
      toast.error("Failed to cancel leave request");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800"
    };
    return colors[status] || colors.pending;
  };

  const getReasonBadgeColor = (reason) => {
    const colors = {
      sick: "bg-red-100 text-red-700",
      emergency: "bg-orange-100 text-orange-700",
      vacation: "bg-blue-100 text-blue-700",
      exam: "bg-purple-100 text-purple-700",
      other: "bg-gray-100 text-gray-700"
    };
    return colors[reason] || colors.other;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} user={user} />
        <div className="flex-1 p-8">
          <Loader message="Loading leave requests..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} user={user} />

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Leave Management
            </h1>
            <p className="text-gray-600">
              Manage your leave requests and track your leave balance
            </p>
          </div>

          {/* Leave Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="text-3xl font-bold text-blue-600">
                {leaveBalance.totalFreeLeaves || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Free Leaves</div>
              <div className="text-xs text-gray-500 mt-2">Per Month</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="text-3xl font-bold text-green-600">
                {leaveBalance.remainingFreeLeaves || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Remaining</div>
              <div className="text-xs text-gray-500 mt-2">This Month</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <div className="text-3xl font-bold text-red-600">
                {leaveBalance.usedFreeLeaves || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Used</div>
              <div className="text-xs text-gray-500 mt-2">This Month</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
              <div className="text-3xl font-bold text-orange-600">
                {leaveBalance.pendingRequests?.length || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
              <div className="text-xs text-gray-500 mt-2">Requests</div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowRequestLeave(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Request Leave
            </button>
          </div>

          {/* Request Leave Modal */}
          {showRequestLeave && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Request Leave
                </h2>

                <form onSubmit={handleRequestLeave} className="space-y-4">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={leaveForm.startDate}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, startDate: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={leaveForm.endDate}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, endDate: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Days Duration */}
                  {leaveForm.startDate && leaveForm.endDate && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-700">
                        <strong>Duration:</strong>{" "}
                        {calculateDays(leaveForm.startDate, leaveForm.endDate)}{" "}
                        days
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <select
                      value={leaveForm.reason}
                      onChange={(e) =>
                        setLeaveForm({ ...leaveForm, reason: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="sick">Sick Leave</option>
                      <option value="emergency">Emergency</option>
                      <option value="vacation">Vacation</option>
                      <option value="exam">Exam Preparation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={leaveForm.description}
                      onChange={(e) =>
                        setLeaveForm({
                          ...leaveForm,
                          description: e.target.value
                        })
                      }
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Provide any additional details..."
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Submit Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRequestLeave(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Leave Requests Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Leave Requests History
              </h3>
            </div>

            {leaveRequests.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">No leave requests found</p>
                <p className="text-gray-400 mt-2 text-sm">
                  Create your first leave request to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {leaveRequests.map((leave) => (
                      <tr key={leave._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(leave.startDate)} to{" "}
                            {formatDate(leave.endDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {leave.totalDays} days
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getReasonBadgeColor(
                              leave.reason
                            )}`}
                          >
                            {leave.reason.charAt(0).toUpperCase() +
                              leave.reason.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              leave.status
                            )}`}
                          >
                            {leave.status.charAt(0).toUpperCase() +
                              leave.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {leave.status === "pending" && (
                            <button
                              onClick={() => cancelLeaveRequest(leave._id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          )}
                          {leave.status !== "pending" && (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Information Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📋 Leave Policy
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="mr-3">•</span>
                <span>
                  <strong>2 Free Leaves:</strong> You get 2 free leaves per
                  month without any deduction
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">•</span>
                <span>
                  <strong>Paid Leaves:</strong> Additional leaves beyond the 2
                  free days will be deducted from your monthly fee as paid leave
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">•</span>
                <span>
                  <strong>Daily Rate:</strong> Calculated as Monthly Fee ÷ 30
                  days
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3">•</span>
                <span>
                  <strong>Cancellation:</strong> Pending requests can be
                  cancelled anytime before approval
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
