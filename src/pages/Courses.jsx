import { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Courses({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("browse"); // browse, create, detail
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // Form states
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    subject: "",
    category: "beginner",
  });
  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    url: "", // In real app, this would be uploaded to Cloudinary
    duration: "",
    type: "long",
  });

  // Comments and Review States
  const [commentText, setCommentText] = useState("");
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await API.get("/user/me");
        setUser(res.data);
      } catch (err) {
        window.location.href = "/";
      }
    };
    loadUser();
  }, []);

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        let url = "/courses";
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (filterSubject) params.append("subject", filterSubject);
        if (sortBy === "topRated") params.append("sort", "topRated");
        
        if (params.toString()) url += "?" + params.toString();
        
        console.log("Loading courses from:", url);
        const res = await API.get(url);
        console.log("Courses loaded successfully:", res.data);
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to load courses:", err);
        console.error("Error details:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [searchTerm, filterSubject, sortBy]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!createForm.title || !createForm.description || !createForm.subject) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      console.log("Creating course with data:", createForm);
      const res = await API.post("/courses", createForm);
      console.log("Course created:", res.data);
      setCourses([res.data, ...courses]);
      setCreateForm({ title: "", description: "", subject: "", category: "beginner" });
      setView("browse");
      alert("Course created successfully!");
    } catch (err) {
      console.error("Course creation error:", err);
      const errorMsg = err.response?.data?.message || err.message;
      alert("Failed to create course: " + errorMsg);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      const res = await API.post(`/courses/${selectedCourse._id}/video`, videoForm);
      setSelectedCourse(res.data);
      setCourses(courses.map(c => c._id === res.data._id ? res.data : c));
      setVideoForm({ title: "", description: "", url: "", duration: "", type: "long" });
      alert("Video added successfully!");
    } catch (err) {
      alert("Failed to add video: " + (err.response?.data?.message || err.message));
    }
  };

  const handleLike = async () => {
    if (!selectedCourse) return;
    try {
      const res = await API.post(`/courses/${selectedCourse._id}/like`);
      setSelectedCourse({ ...selectedCourse, likes: res.data.likes, dislikes: res.data.dislikes });
    } catch (err) {
      console.error("Failed to like course", err);
    }
  };

  const handleDislike = async () => {
    if (!selectedCourse) return;
    try {
      const res = await API.post(`/courses/${selectedCourse._id}/dislike`);
      setSelectedCourse({ ...selectedCourse, likes: res.data.likes, dislikes: res.data.dislikes });
    } catch (err) {
      console.error("Failed to dislike course", err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !commentText.trim()) return;
    try {
      const res = await API.post(`/courses/${selectedCourse._id}/comment`, { text: commentText });
      setSelectedCourse({ ...selectedCourse, comments: res.data });
      setCommentText("");
    } catch (err) {
      alert("Failed to add comment: " + (err.response?.data?.message || err.message));
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await API.post(`/courses/${selectedCourse._id}/review`, { rating: ratingValue, comment: reviewComment });
      alert("Rating submitted successfully!");
      setRatingValue(5);
      setReviewComment("");
      const updated = await API.get(`/courses/${selectedCourse._id}`);
      setSelectedCourse(updated.data);
    } catch (err) {
      alert("Failed to submit rating: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEnroll = async () => {
    if (!selectedCourse) return;
    try {
      await API.post(`/courses/${selectedCourse._id}/enroll`);
      alert("Enrolled successfully!");
    } catch (err) {
      console.error("Failed to enroll", err);
    }
  };

  if (!user) return <div className="card">Loading...</div>;

  return (
    <div className="layout">
      <div className={"overlay " + (isSidebarOpen ? "open" : "")} onClick={() => toggleSidebar && toggleSidebar(false)} />
      <Sidebar user={user} isOpen={isSidebarOpen} onClose={() => toggleSidebar && toggleSidebar(false)} />

      <main className="main" style={{ padding: "20px" }}>
        {/* HEADER */}
        <div className="hero" style={{ marginBottom: "30px" }}>
          <div className="lead">
            <h2 style={{ margin: "0 0 10px 0" }}>🎓 Expert Courses</h2>
            <p className="muted">Learn from certified teachers or share your expertise</p>
          </div>
          {user.registrationType === "teacher" && (
            <button onClick={() => setView(view === "create" ? "browse" : "create")} style={{ background: "var(--accent-1)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
              {view === "create" ? "← Back to Browse" : "+ Create Course"}
            </button>
          )}
        </div>

        {/* CREATE COURSE FORM - TEACHER ONLY */}
        {view === "create" && user.registrationType === "teacher" && (
          <div className="card" style={{ maxWidth: "600px", margin: "0 auto 30px", padding: "30px", borderRadius: "15px" }}>
            <h3 style={{ marginBottom: "20px" }}>Create New Course</h3>
            <form onSubmit={handleCreateCourse}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", display: "block", marginBottom: "5px" }}>Course Title</label>
                <input name="title" placeholder="e.g. Complete Math for Class 12" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} required style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }} />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", display: "block", marginBottom: "5px" }}>Description</label>
                <textarea placeholder="Describe what students will learn..." value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} required style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", minHeight: "100px" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", display: "block", marginBottom: "5px" }}>Subject</label>
                  <input name="subject" placeholder="e.g. Mathematics" value={createForm.subject} onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })} required style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", display: "block", marginBottom: "5px" }}>Level</label>
                  <select value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <button type="submit" style={{ width: "100%", background: "var(--accent-1)", color: "white", border: "none", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                Create Course
              </button>
            </form>
          </div>
        )}

        {/* BROWSE COURSES */}
        {view === "browse" && (
          <>
            {/* FILTERS */}
            <div className="card" style={{ marginBottom: "30px", padding: "20px", borderRadius: "12px", display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                placeholder="🔍 Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, minWidth: "200px", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }}
              />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }}
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
                <option value="Biology">Biology</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px" }}
              >
                <option value="latest">Latest</option>
                <option value="topRated">Top Rated</option>
              </select>
            </div>

            {/* COURSES GRID */}
            {loading ? (
              <div className="card" style={{ textAlign: "center", padding: "40px" }}>Loading courses...</div>
            ) : courses.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "40px" }}>
                <p className="muted">No courses found. {user.registrationType === "teacher" ? "Be the first to create one!" : ""}</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                {courses.map((course) => (
                  <div
                    key={course._id}
                    onClick={() => {
                      setSelectedCourse(course);
                      setView("detail");
                    }}
                    style={{
                      background: "white",
                      border: "1px solid #e0e0e0",
                      borderRadius: "12px",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Course Header */}
                    <div style={{ background: "linear-gradient(135deg, var(--accent-1) 0%, rgba(201,163,94,0.7) 100%)", color: "white", padding: "20px", minHeight: "120px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <h3 style={{ margin: "0 0 10px 0", fontSize: "1.1rem", fontWeight: "700" }}>{course.title}</h3>
                      <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: "4px", width: "fit-content" }}>{course.subject}</span>
                    </div>

                    {/* Course Info */}
                    <div style={{ padding: "15px" }}>
                      <div style={{ marginBottom: "10px" }}>
                        <p className="muted" style={{ margin: "0 0 5px 0", fontSize: "13px" }}>By {course.teacher?.fullName}</p>
                        {course.teacher?.teacherDetails?.fees && (
                          <p style={{ margin: "0 0 5px 0", fontSize: "13px", fontWeight: "600", color: "var(--accent-1)" }}>
                            ₹{course.teacher.teacherDetails.fees.minFee} - ₹{course.teacher.teacherDetails.fees.maxFee}/month
                          </p>
                        )}
                      </div>

                      {/* Rating */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <span style={{ color: "#f1c40f", fontSize: "14px" }}>{'★'.repeat(Math.round(course.averageRating))}</span>
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>({course.totalReviews} reviews)</span>
                      </div>

                      {/* Stats */}
                      <div style={{ display: "flex", gap: "10px", fontSize: "12px", color: "var(--muted)" }}>
                        <span>📹 {course.videos?.length || 0} videos</span>
                        <span>👥 {course.enrolledStudents} students</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* COURSE DETAIL VIEW */}
        {view === "detail" && selectedCourse && (
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <button onClick={() => setView("browse")} style={{ background: "#f3f4f6", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginBottom: "20px", fontWeight: "600" }}>
              ← Back to Courses
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "30px" }}>
              {/* Main Content */}
              <div className="card" style={{ padding: "30px", borderRadius: "15px" }}>
                <h1 style={{ margin: "0 0 10px 0" }}>{selectedCourse.title}</h1>
                <p className="muted" style={{ margin: "0 0 20px 0" }}>By <strong>{selectedCourse.teacher?.fullName}</strong></p>

                <p style={{ lineHeight: "1.6", marginBottom: "20px" }}>{selectedCourse.description}</p>

                {/* Videos Section */}
                <div style={{ marginBottom: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                  <h3 style={{ marginBottom: "15px" }}>📹 Course Videos</h3>
                  {selectedCourse.videos?.length === 0 ? (
                    <p className="muted">No videos yet</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {selectedCourse.videos.map((video, idx) => (
                        <div key={idx} style={{ background: "#f9f9f9", padding: "15px", borderRadius: "8px", border: "1px solid #eee", display: "flex", gap: "15px", alignItems: "center" }}>
                          <div style={{ background: "var(--accent-1)", color: "white", width: "60px", height: "60px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
                            📹
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: "0 0 5px 0", fontWeight: "600" }}>{video.title}</p>
                            <p style={{ margin: "0", fontSize: "12px", color: "var(--muted)" }}>
                              {video.type === "short" ? "⚡ Short Clip" : "🎬 Full Tutorial"} · {Math.floor(video.duration / 60)} mins
                            </p>
                          </div>
                          <button style={{ background: "var(--accent-1)", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
                            ▶ Watch
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Video Form - Only for Teacher */}
                  {selectedCourse.teacher?._id === user._id && (
                    <div style={{ marginTop: "20px", padding: "20px", background: "#f9f9f9", borderRadius: "10px", border: "1px dashed var(--accent-1)" }}>
                      <h4 style={{ marginBottom: "15px" }}>Add New Video</h4>
                      <form onSubmit={handleAddVideo}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                          <input placeholder="Video Title" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} required style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px" }} />
                          <select value={videoForm.type} onChange={(e) => setVideoForm({ ...videoForm, type: e.target.value })} style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px" }}>
                            <option value="short">Short Clip</option>
                            <option value="long">Full Tutorial</option>
                          </select>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                          <input placeholder="Video URL (Cloudinary)" value={videoForm.url} onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })} required style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px" }} />
                          <input type="number" placeholder="Duration (seconds)" value={videoForm.duration} onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })} required style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px" }} />
                        </div>
                        <button type="submit" style={{ width: "100%", background: "var(--accent-1)", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                          Upload Video
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Engagement Section */}
                <div style={{ marginBottom: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                  <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
                    <button onClick={handleLike} style={{ flex: 1, background: selectedCourse.likedBy?.includes(user._id) ? "var(--accent-1)" : "#f3f4f6", color: selectedCourse.likedBy?.includes(user._id) ? "white" : "#333", border: "none", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                      👍 Like ({selectedCourse.likes})
                    </button>
                    <button onClick={handleDislike} style={{ flex: 1, background: selectedCourse.dislikedBy?.includes(user._id) ? "var(--accent-1)" : "#f3f4f6", color: selectedCourse.dislikedBy?.includes(user._id) ? "white" : "#333", border: "none", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                      👎 Dislike ({selectedCourse.dislikes})
                    </button>
                    <button onClick={handleEnroll} style={{ flex: 1, background: "var(--accent-1)", color: "white", border: "none", padding: "12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                      ✏️ Enroll Now
                    </button>
                  </div>

                  {/* Rating Form */}
                  <div style={{ background: "#f9f9f9", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
                    <h4 style={{ marginBottom: "12px" }}>Rate This Course</h4>
                    <form onSubmit={handleAddReview}>
                      <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button key={num} type="button" onClick={() => setRatingValue(num)} style={{ fontSize: "24px", cursor: "pointer", background: "none", border: "none", opacity: num <= ratingValue ? 1 : 0.4 }}>
                            ★
                          </button>
                        ))}
                      </div>
                      <textarea placeholder="Share your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px", minHeight: "70px", marginBottom: "10px" }} />
                      <button type="submit" style={{ width: "100%", background: "var(--accent-1)", color: "white", border: "none", padding: "10px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                        Submit Rating
                      </button>
                    </form>
                  </div>

                  {/* Comments Section */}
                  <div>
                    <h4 style={{ marginBottom: "15px" }}>💬 Comments ({selectedCourse.comments?.length || 0})</h4>
                    <form onSubmit={handleAddComment} style={{ marginBottom: "20px", padding: "15px", background: "#f9f9f9", borderRadius: "10px" }}>
                      <textarea placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} required style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "13px", minHeight: "60px", marginBottom: "10px" }} />
                      <button type="submit" style={{ background: "var(--accent-1)", color: "white", border: "none", padding: "10px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
                        Post Comment
                      </button>
                    </form>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {selectedCourse.comments?.map((comment) => (
                        <div key={comment._id} style={{ background: "#f9f9f9", padding: "12px", borderRadius: "8px", border: "1px solid #eee" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-1)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold" }}>
                              {comment.student?.fullName?.charAt(0) || "S"}
                            </div>
                            <div>
                              <p style={{ margin: "0", fontWeight: "600", fontSize: "13px" }}>{comment.student?.fullName}</p>
                              <p style={{ margin: "0", fontSize: "11px", color: "var(--muted)" }}>
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p style={{ margin: "0", fontSize: "13px", lineHeight: "1.4" }}>{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div>
                <div className="card" style={{ padding: "20px", borderRadius: "12px", marginBottom: "20px" }}>
                  <h3 style={{ margin: "0 0 15px 0" }}>Course Info</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                    <div>
                      <p style={{ margin: "0 0 5px 0", color: "var(--muted)", fontSize: "11px", fontWeight: "600" }}>Level</p>
                      <p style={{ margin: "0", fontWeight: "600", textTransform: "capitalize" }}>{selectedCourse.category}</p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 5px 0", color: "var(--muted)", fontSize: "11px", fontWeight: "600" }}>Rating</p>
                      <p style={{ margin: "0" }}>
                        ⭐ {selectedCourse.averageRating}/5 ({selectedCourse.totalReviews} reviews)
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 5px 0", color: "var(--muted)", fontSize: "11px", fontWeight: "600" }}>Enrolled</p>
                      <p style={{ margin: "0" }}>{selectedCourse.enrolledStudents} students</p>
                    </div>
                  </div>
                </div>

                {/* Instructor Card */}
                <div className="card" style={{ padding: "20px", borderRadius: "12px" }}>
                  <h3 style={{ margin: "0 0 15px 0" }}>Instructor</h3>
                  <div style={{ textAlign: "center" }}>
                    {selectedCourse.teacher?.profilePic?.url ? (
                      <img src={selectedCourse.teacher.profilePic.url} alt={selectedCourse.teacher?.fullName} style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", marginBottom: "10px", border: "3px solid var(--accent-1)" }} />
                    ) : (
                      <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--accent-1)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "auto", marginBottom: "10px" }}>
                        👨‍🏫
                      </div>
                    )}
                    <h4 style={{ margin: "10px 0 5px 0" }}>{selectedCourse.teacher?.fullName}</h4>
                    {selectedCourse.teacher?.teacherDetails?.fees && (
                      <p style={{ margin: "0 0 10px 0", color: "var(--accent-1)", fontWeight: "600", fontSize: "13px" }}>
                        ₹{selectedCourse.teacher.teacherDetails.fees.minFee} - ₹{selectedCourse.teacher.teacherDetails.fees.maxFee}/month
                      </p>
                    )}
                    <p style={{ margin: "0", fontSize: "12px", color: "var(--muted)" }}>
                      ⭐ {selectedCourse.teacher?.teacherDetails?.averageRating || 0} ({selectedCourse.teacher?.teacherDetails?.totalReviews || 0} reviews)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}