import { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";

export default function TeacherBidding({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherPremium, setTeacherPremium] = useState(false);
  const [bidModal, setBidModal] = useState(null);
  const [bidForm, setBidForm] = useState({
    monthlyFee: "",
    message: "",
  });

  useEffect(() => {
    fetchUserAndStudents();
  }, []);

  const fetchUserAndStudents = async () => {
    try {
      const userResponse = await API.get("/user/profile");
      setUser(userResponse.data);

      const studentsResponse = await API.get("/bids/students");
      setStudents(studentsResponse.data.students);
      setTeacherPremium(studentsResponse.data.teacherPremium);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (studentId) => {
    if (!bidForm.monthlyFee || parseFloat(bidForm.monthlyFee) <= 0) {
      toast.error("Please enter a valid monthly fee");
      return;
    }

    const student = students.find(s => s._id === studentId);
    const maxBid = teacherPremium ? Infinity : 2000;

    if (!teacherPremium && parseFloat(bidForm.monthlyFee) > 2000) {
      toast.error("Non-premium teachers can only bid up to ₹2000/month");
      return;
    }

    if (student.isPremiumStudent && !teacherPremium) {
      toast.error("Only premium teachers can bid on premium students");
      return;
    }

    try {
      await API.post("/bids/bid", {
        studentId,
        monthlyFee: parseFloat(bidForm.monthlyFee),
        message: bidForm.message,
      });

      toast.success("Bid placed successfully!");
      setBidModal(null);
      setBidForm({ monthlyFee: "", message: "" });
      fetchUserAndStudents(); // Refresh the list
    } catch (error) {
      console.error("Error placing bid:", error);
      toast.error(error.response?.data?.message || "Failed to place bid");
    }
  };

  const openBidModal = (student) => {
    setBidModal(student);
    setBidForm({ monthlyFee: "", message: "" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} user={user} />
        <div className="flex-1 p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} user={user} />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Students</h1>
            <p className="text-gray-600">
              Browse available students and place bids to start teaching
            </p>
            {!teacherPremium && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  <strong>Free Account:</strong> You can only bid on students paying up to ₹2000/month.
                  Upgrade to premium to bid on higher-paying students.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div
                key={student._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={student.profilePic?.url || "/default-avatar.png"}
                    alt={student.fullName}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{student.fullName}</h3>
                    {student.isPremiumStudent && (
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        Premium Student
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Standard:</strong> {student.studentDetails?.standard || "Not specified"}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Board:</strong> {student.studentDetails?.board || "Not specified"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Subjects:</strong>{" "}
                    {student.studentDetails?.subjects?.join(", ") || "Not specified"}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  {student.canBid ? (
                    <button
                      onClick={() => openBidModal(student)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Place Bid
                    </button>
                  ) : (
                    <span className="text-red-600 text-sm">
                      {student.isPremiumStudent
                        ? "Requires premium teacher"
                        : "Not eligible to bid"}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    Max bid: ₹{student.maxBidAmount === Infinity ? "Unlimited" : student.maxBidAmount}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {students.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No students available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bid Modal */}
      {bidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Place Bid for {bidModal.fullName}</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Fee (₹)
              </label>
              <input
                type="number"
                value={bidForm.monthlyFee}
                onChange={(e) => setBidForm({ ...bidForm, monthlyFee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter monthly fee"
                min="1"
                max={teacherPremium ? undefined : 2000}
              />
              {!teacherPremium && (
                <p className="text-sm text-gray-500 mt-1">Maximum: ₹2000/month</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={bidForm.message}
                onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Introduce yourself and explain why you'd be a good teacher..."
                maxLength="500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setBidModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePlaceBid(bidModal._id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Place Bid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}