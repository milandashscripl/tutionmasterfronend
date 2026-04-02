import { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";

export default function StudentBids({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAndBids();
  }, []);

  const fetchUserAndBids = async () => {
    try {
      const userResponse = await API.get("/user/profile");
      setUser(userResponse.data);

      const bidsResponse = await API.get("/bids/student-bids");
      setBids(bidsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load bids");
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToBid = async (bidId, action) => {
    try {
      await API.post("/bids/respond", { bidId, action });
      toast.success(`Bid ${action}ed successfully!`);
      fetchUserAndBids(); // Refresh the list
    } catch (error) {
      console.error("Error responding to bid:", error);
      toast.error(error.response?.data?.message || `Failed to ${action} bid`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Bids</h1>
            <p className="text-gray-600">
              Review and respond to bids from teachers interested in teaching you
            </p>
          </div>

          {bids.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No bids received yet.</p>
              <p className="text-gray-400 mt-2">
                Teachers will send you bids once they find your profile interesting.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bids.map((bid) => (
                <div
                  key={bid._id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <img
                        src={bid.teacher?.profilePic?.url || "/default-avatar.png"}
                        alt={bid.teacher?.fullName}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{bid.teacher?.fullName}</h3>
                        <p className="text-gray-600 text-sm">
                          {bid.teacher?.teacherDetails?.subjectsExpert?.join(", ") || "Subjects not specified"}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Experience: {bid.teacher?.teacherDetails?.teachingUpto || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bid.status)}`}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                      <p className="text-2xl font-bold text-green-600 mt-2">
                        ₹{bid.monthlyFee}/month
                      </p>
                    </div>
                  </div>

                  {bid.message && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Message from Teacher:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{bid.message}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Bid placed on {new Date(bid.bidAt).toLocaleDateString()}
                      {bid.respondedAt && (
                        <span className="ml-2">
                          • Responded on {new Date(bid.respondedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {bid.status === "pending" && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleRespondToBid(bid._id, "reject")}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleRespondToBid(bid._id, "accept")}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </div>

                  {bid.teacher?.teacherDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Teacher Details:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Rating:</span>
                          <div className="flex items-center">
                            <span className="font-medium">
                              {bid.teacher.teacherDetails.averageRating?.toFixed(1) || "N/A"}
                            </span>
                            <span className="text-yellow-500 ml-1">★</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Reviews:</span>
                          <span className="font-medium">
                            {bid.teacher.teacherDetails.totalReviews || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Min Fee:</span>
                          <span className="font-medium">
                            ₹{bid.teacher.teacherDetails.fees?.minFee || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Max Fee:</span>
                          <span className="font-medium">
                            ₹{bid.teacher.teacherDetails.fees?.maxFee || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}