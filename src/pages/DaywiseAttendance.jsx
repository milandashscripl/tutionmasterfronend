import { useState, useEffect } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";

export default function DaywiseAttendance({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [selectedStudent, setSelectedStudent] = useState("");
  const [viewMode, setViewMode] = useState("calendar"); // calendar or list
  const [markingDate, setMarkingDate] = useState("");
  const [markingStatus, setMarkingStatus] = useState("present");
  const [markingNotes, setMarkingNotes] = useState("");

  useEffect(() => {
    fetchUserData();
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchAttendance();
    fetchStats();
  }, [filterMonth, filterYear, selectedStudent]);

  const fetchUserData = async () => {
    try {
      const res = await API.get("/user/me");
      setUser(res.data);
    } catch (error) {
      console.error("Failed to fetch user data");
    }
  };

  const fetchStudents = async () => {
    try {
      // Fetch hired students - adjust endpoint based on your backend
      const response = await API.get("/students/hired");
      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Failed to fetch students");
      // Fallback: show empty list
      setStudents([]);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await API.get("/attendance/teacher/daywise", {
        params: {
          studentId: selectedStudent,
          month: filterMonth,
          year: filterYear
        }
      });
      setAttendance(response.data.daywiseAttendance || []);
    } catch (error) {
      toast.error("Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get("/attendance/summary", {
        params: {
          studentId: selectedStudent,
          month: filterMonth,
          year: filterYear
        }
      });
      setStats(response.data.summary || {});
    } catch (error) {
      console.error("Failed to fetch stats");
    }
  };

  const handleMarkAttendance = async () => {
    if (!markingDate) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }

    try {
      await API.post("/attendance/mark-daily", {
        studentId: selectedStudent,
        date: markingDate,
        status: markingStatus,
        notes: markingNotes
      });

      toast.success("Attendance marked successfully");
      setMarkingDate("");
      setMarkingStatus("present");
      setMarkingNotes("");
      fetchAttendance();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      present: "bg-green-100 text-green-800 border-green-300",
      absent: "bg-red-100 text-red-800 border-red-300",
      cancelled: "bg-gray-100 text-gray-800 border-gray-300"
    };
    return colors[status] || colors.present;
  };

  const getStatusIcon = (status) => {
    const icons = {
      present: "✓",
      absent: "✗",
      cancelled: "—"
    };
    return icons[status] || "?";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

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

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const getAttendanceForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    const record = attendance.find((a) => a.date === dateStr);
    return record ? record.records[0]?.status : null;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(filterMonth, filterYear);
    const firstDay = new Date(filterYear, filterMonth - 1, 1).getDay();
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(filterYear, filterMonth - 1, day);
      const status = getAttendanceForDate(date);
      const dateStr = date.toISOString().split("T")[0];

      days.push(
        <div
          key={day}
          className={`p-3 border rounded-lg text-center relative ${
            status
              ? getStatusColor(status)
              : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
          style={{ minHeight: "80px", cursor: "pointer" }}
        >
          <div className="font-semibold text-sm">{day}</div>
          {status && (
            <div className="text-lg font-bold mt-1 flex items-center justify-center h-8">
              {getStatusIcon(status)}
            </div>
          )}
          {!status && <div className="text-xs text-gray-400 mt-2">—</div>}
        </div>
      );
    }

    return days;
  };

  if (loading && attendance.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} user={user} />
        <div className="flex-1 p-8">
          <Loader message="Loading attendance records..." />
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
              Daily Attendance Tracking
            </h1>
            <p className="text-gray-600">
              Track presence and absence of students day-wise
            </p>
          </div>

          {/* Quick Stats */}
          {stats.total > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Days</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="text-3xl font-bold text-green-600">
                  {stats.present}
                </div>
                <div className="text-sm text-gray-600 mt-1">Present</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                <div className="text-3xl font-bold text-red-600">
                  {stats.absent}
                </div>
                <div className="text-sm text-gray-600 mt-1">Absent</div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.attendancePercentage}%
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Attendance Rate
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Students</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.fullName}
                    </option>
                  ))}
                </select>
              </div>

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
                  View
                </label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="calendar">Calendar View</option>
                  <option value="list">List View</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  &nbsp;
                </label>
                <button
                  onClick={fetchAttendance}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Mark Attendance Section */}
          {selectedStudent && (
            <div className="bg-white rounded-lg shadow p-6 mb-6 border-2 border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mark Daily Attendance
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={markingDate}
                    onChange={(e) => setMarkingDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={markingStatus}
                    onChange={(e) => setMarkingStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="present">✓ Present</option>
                    <option value="absent">✗ Absent</option>
                    <option value="cancelled">— Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={markingNotes}
                    onChange={(e) => setMarkingNotes(e.target.value)}
                    placeholder="e.g., Sick, Emergency"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <button
                    onClick={handleMarkAttendance}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Mark Attendance
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Calendar View */}
          {viewMode === "calendar" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                <span>
                  {months[filterMonth - 1]} {filterYear}
                </span>
                <span className="text-sm font-normal text-gray-600">
                  {selectedStudent ? "Selected Student" : "All Students"}
                </span>
              </h3>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-gray-700 py-2"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
              </div>

              {/* Legend */}
              <div className="mt-6 flex gap-4 flex-wrap justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                  <span className="text-sm">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
                  <span className="text-sm">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                  <span className="text-sm">Cancelled</span>
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Attendance Records
                </h3>
              </div>

              {attendance.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 text-lg">No attendance records</p>
                  <p className="text-gray-400 mt-2 text-sm">
                    No records found for the selected filters
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Present
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Absent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                          Cancelled
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {attendance.map((record) => (
                        <tr key={record.date} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(record.date)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {record.records.length === 0
                                ? "No records"
                                : record.records[0].status}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-green-600 font-medium">
                              {record.present}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-red-600 font-medium">
                              {record.absent}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 font-medium">
                              {record.cancelled}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
