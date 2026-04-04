import { useState, useEffect } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const AdminLeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    teacherId: ''
  });

  useEffect(() => {
    fetchLeaveRequests();
  }, [filters]);

  const fetchLeaveRequests = async () => {
    try {
      const response = await API.get('/leaves/admin', {
        params: filters
      });
      setLeaveRequests(response.data.leaveRequests);
    } catch (error) {
      toast.error("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const processLeaveRequest = async (leaveId, action, adminNotes = '') => {
    try {
      await API.put(`/leaves/${leaveId}/process`, {
        action,
        adminNotes
      });
      toast.success(`Leave request ${action}d successfully`);
      fetchLeaveRequests();
    } catch (error) {
      toast.error(`Failed to ${action} leave request`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
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
    return <Loader message="Loading request queue..." className="mx-auto" />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Leave Request Management</h1>

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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <input
              type="text"
              placeholder="Teacher ID"
              value={filters.teacherId}
              onChange={(e) => setFilters({...filters, teacherId: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Affected Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{request.teacher?.name}</div>
                        <div className="text-gray-500">{request.teacher?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.daysRequested}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.reason}
                      {request.description && (
                        <div className="text-xs text-gray-600 mt-1">
                          {request.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.affectedSessions?.length || 0} sessions
                      {request.affectedSessions?.length > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          Students affected: {new Set(request.affectedSessions.map(s => s.studentId)).size}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const notes = prompt("Admin notes (optional):");
                              processLeaveRequest(request._id, 'approve', notes);
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt("Rejection reason:");
                              if (notes) processLeaveRequest(request._id, 'reject', notes);
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {request.status === 'approved' && (
                        <span className="text-green-600">Approved</span>
                      )}
                      {request.status === 'rejected' && (
                        <div>
                          <span className="text-red-600">Rejected</span>
                          {request.adminNotes && (
                            <div className="text-xs text-gray-600 mt-1">
                              Note: {request.adminNotes}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {leaveRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No leave requests found for the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLeaveManagement;