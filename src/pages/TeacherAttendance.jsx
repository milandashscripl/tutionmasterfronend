import { useState, useEffect } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const TeacherAttendance = () => {
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    studentId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    subject: '',
    chapter: '',
    medium: 'english',
    location: 'student_home'
  });

  useEffect(() => {
    fetchTodayAttendance();
    fetchAllAttendance();
    fetchStats();
  }, [filters]);

  const fetchTodayAttendance = async () => {
    try {
      const response = await API.get('/attendance/teacher/today');
      setTodayAttendance(response.data.attendance);
    } catch (error) {
      console.error("Failed to fetch today's attendance");
    }
  };

  const fetchAllAttendance = async () => {
    try {
      const response = await API.get('/attendance/teacher', {
        params: filters
      });
      setAllAttendance(response.data.attendance);
    } catch (error) {
      toast.error("Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get('/attendance/stats');
      setStats(response.data.summary);
    } catch (error) {
      console.error("Failed to fetch attendance stats");
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      await API.post('/attendance/mark', attendanceForm);
      toast.success("Attendance marked successfully");
      setShowMarkAttendance(false);
      setAttendanceForm({
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        subject: '',
        chapter: '',
        medium: 'english',
        location: 'student_home'
      });
      fetchTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    }
  };

  const updateAttendanceStatus = async (attendanceId, status, additionalData = {}) => {
    try {
      await API.put(`/attendance/${attendanceId}/status`, {
        status,
        ...additionalData
      });
      toast.success("Attendance updated successfully");
      fetchTodayAttendance();
      fetchAllAttendance();
    } catch (error) {
      toast.error("Failed to update attendance");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'reached': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
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
    return <Loader message="Loading attendance data..." className="mx-auto" />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Attendance Management</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSessions || 0}</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.completedSessions || 0}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.attendanceRate || 0}%</div>
            <div className="text-sm text-gray-600">Attendance Rate</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating || 0}</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <button
            onClick={() => setShowMarkAttendance(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Mark New Attendance
          </button>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Today's Sessions</h2>
          {todayAttendance.length === 0 ? (
            <p className="text-gray-500">No sessions scheduled for today.</p>
          ) : (
            <div className="space-y-4">
              {todayAttendance.map((record) => (
                <div key={record._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{record.student?.name}</h3>
                      <p className="text-sm text-gray-600">{record.subject} - {record.startTime} to {record.endTime}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </div>

                  {record.status === 'scheduled' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateAttendanceStatus(record._id, 'reached', {
                          actualStartTime: new Date().toTimeString().slice(0, 5),
                          locationReached: record.location
                        })}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                      >
                        Mark as Reached
                      </button>
                    </div>
                  )}

                  {record.status === 'reached' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const rating = prompt("Enter rating (1-5):");
                          const feedback = prompt("Enter feedback:");
                          if (rating && feedback) {
                            updateAttendanceStatus(record._id, 'completed', {
                              actualEndTime: new Date().toTimeString().slice(0, 5),
                              rating: parseInt(rating),
                              feedback
                            });
                          }
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mark Attendance Modal */}
        {showMarkAttendance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
              <form onSubmit={handleMarkAttendance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student ID</label>
                  <input
                    type="text"
                    value={attendanceForm.studentId}
                    onChange={(e) => setAttendanceForm({...attendanceForm, studentId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={attendanceForm.date}
                    onChange={(e) => setAttendanceForm({...attendanceForm, date: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      type="time"
                      value={attendanceForm.startTime}
                      onChange={(e) => setAttendanceForm({...attendanceForm, startTime: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                      type="time"
                      value={attendanceForm.endTime}
                      onChange={(e) => setAttendanceForm({...attendanceForm, endTime: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={attendanceForm.subject}
                    onChange={(e) => setAttendanceForm({...attendanceForm, subject: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Medium</label>
                  <select
                    value={attendanceForm.medium}
                    onChange={(e) => setAttendanceForm({...attendanceForm, medium: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="odia">Odia</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Mark Attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMarkAttendance(false)}
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

export default TeacherAttendance;