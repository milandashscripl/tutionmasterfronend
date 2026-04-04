import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";

export default function Home({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [matchedTeachers, setMatchedTeachers] = useState([]);
  const [teacherSuggestions, setTeacherSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("list"); // 'list' or 'grid'

  // --- RATING & REVIEW STATES ---
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  const [ratingValue, setRatingValue] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const userRes = await API.get("/user/me");
        setUser(userRes.data);

        if (userRes.data.settings) {
          applyGlobalTheme(userRes.data.settings.theme, userRes.data.settings.darkMode);
        }

        if (userRes.data.registrationType === "student") {
          const matchRes = await API.get("/user/matches");
          if (Array.isArray(matchRes.data)) {
            setMatchedTeachers(matchRes.data);
          } else if (matchRes.data.matched) {
            setMatchedTeachers(matchRes.data.matched);
          }
        } else if (userRes.data.registrationType === "teacher") {
          try {
            const suggestionRes = await API.get("/user/suggestions");
            setTeacherSuggestions(suggestionRes.data?.students || []);
          } catch (err) {
            if (err.response?.status === 403) {
              console.warn("Teacher suggestions require premium membership", err.response.data.message);
            } else {
              console.error("Could not load suggestions:", err);
            }
          }
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleViewReviews = async (teacher) => {
    setSelectedTeacher(teacher);
    setLoadingReviews(true);
    setShowReviewsModal(true);
    try {
      const res = await API.get(`/user/reviews/${teacher._id}`);
      setReviews(res.data);
    } catch (err) {
      alert("Could not load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleRateSubmit = async () => {
    try {
      await API.post("/user/rate", {
        teacherId: selectedTeacher._id,
        rating: ratingValue,
        comment: comment
      });
      alert("Rating submitted successfully!");
      setShowRatingModal(false);
      setComment("");
      const matchRes = await API.get("/user/matches");
      setMatchedTeachers(matchRes.data);
    } catch (err) {
      alert("Failed to submit rating: " + (err.response?.data?.message || err.message));
    }
  };

  const getExpectedHireAmount = (teacher) => {
    const standard = user?.studentDetails?.standard;
    if (!standard) return null;

    const pricingEntry = teacher?.teacherDetails?.pricing?.find((item) => item.standard === standard);
    const minFee = teacher?.teacherDetails?.fees?.minFee || 0;
    const baseFee = pricingEntry?.price || minFee;

    const rating = Number(teacher?.teacherDetails?.averageRating) || 0;
    const multiplier = 1 + Math.max(0, rating - 4) * 0.1;

    return baseFee > 0 ? Math.ceil(baseFee * multiplier) : null;
  };

  const handleHire = async (teacher) => {
    try {
      const amount = getExpectedHireAmount(teacher);
      if (!amount) {
        return alert("Unable to calculate hiring fee. Please ensure your profile standard and teacher pricing are set.");
      }

      const res = await API.post("/user/hire", { teacherId: teacher._id, amount });
      alert(`${res.data?.message || "Teacher hired successfully."} You paid ₹${amount}`);

      // Optionally refresh matches
      const matchRes = await API.get("/user/matches");
      setMatchedTeachers(matchRes.data);
    } catch (err) {
      alert("Failed to hire: " + (err.response?.data?.message || err.message));
    }
  };

  const handlePurchaseMembership = async (membershipType) => {
    try {
      const res = await API.post("/user/membership", { type: membershipType, months: 1 });
      alert(`Membership activated: ${res.data.membership}. Expires ${new Date(res.data.expiry).toLocaleDateString()}`);
      const updatedUser = await API.get("/user/me");
      setUser(updatedUser.data);
      if (membershipType === "teacher_premium") {
        const suggestions = await API.get("/user/suggestions");
        setTeacherSuggestions(suggestions.data);
      }
    } catch (err) {
      alert("Failed to purchase membership: " + (err.response?.data?.message || err.message));
    }
  };

  const applyGlobalTheme = (themeName, isDark) => {
    const themes = {
      light: { "--bg": "#faf9f7", "--accent-1": "#c9a35e", "--muted": "#8b7968", "--text": "#1f1e1c" },
      blue: { "--bg": "#f0f4f8", "--accent-1": "#4a90e2", "--muted": "#627394", "--text": "#1a202c" },
      green: { "--bg": "#f0f8f4", "--accent-1": "#48bb78", "--muted": "#4a7c59", "--text": "#1e3a1f" },
      purple: { "--bg": "#f5f3f8", "--accent-1": "#9f7aea", "--muted": "#6b5b95", "--text": "#2d1b4e" },
    };
    const selected = themes[themeName] || themes.light;
    Object.keys(selected).forEach((key) => {
      document.documentElement.style.setProperty(key, selected[key]);
    });
    if (isDark) {
      document.body.style.backgroundColor = "#1a1a1a";
      document.body.style.color = "#f0f0f0";
    }
  };

  if (loading || !user) return <Loader message="Preparing your dashboard..." className="mx-auto" />;

  return (
    <div className="layout">
      <div className={`overlay ${isSidebarOpen ? "open" : ""}`} onClick={() => toggleSidebar(false)} />
      <Sidebar user={user} isOpen={isSidebarOpen} onClose={() => toggleSidebar(false)} />

      <main className="main">
        {/* HERO */}
        <div className="hero">
          <div className="lead">
            <h2 className="welcome-text">Welcome, {user.fullName?.split(" ")[0]}</h2>
            <p className="muted">Manage your learning journey and connect with experts.</p>
          </div>
          <div className="cta">
            <button onClick={() => (window.location.href = "/chats")} style={{ background: "var(--accent-1)", color: "white" }}>Open Messenger</button>
            <button onClick={() => (window.location.href = "/profile")} style={{ background: "transparent", border: "1px solid rgba(15,23,36,0.1)", color: "var(--text)" }}>Edit Profile</button>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Account Status</h4>
            <div className="stat-number" style={{ fontSize: "1.1rem", color: "var(--accent-1)" }}>{user.isApproved ? "Verified" : "Pending"}</div>
            <div className="muted">{user.registrationType}</div>
          </div>
          <div className="stat-card">
            <h4>Joined</h4>
            <div className="stat-number">{new Date(user.createdAt).getFullYear()}</div>
            <div className="muted">Member since</div>
          </div>
          <div className="stat-card">
            <h4>Membership</h4>
            <div className="stat-number" style={{ fontSize: "1rem", color: user.membership?.includes("premium") ? "#16a34a" : "#6b7280" }}>{user.membership || "free"}</div>
            <div className="muted">{user.membershipExpiry ? new Date(user.membershipExpiry).toLocaleDateString() : "No expiry"}</div>
            {user.membership !== "student_premium" && user.registrationType === "student" && (
              <button onClick={() => handlePurchaseMembership("student_premium")} style={{ marginTop: "10px", padding: "6px 10px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Buy Student Premium</button>
            )}
            {user.membership !== "teacher_premium" && user.registrationType === "teacher" && (
              <button onClick={() => handlePurchaseMembership("teacher_premium")} style={{ marginTop: "10px", padding: "6px 10px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Buy Teacher Premium</button>
            )}
          </div>
        </div>

        {/* MATCHED TEACHERS SECTION */}
        {user.registrationType === "student" && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: 0 }}>Recommended Teachers</h3>
                <span style={{ fontSize: "12px", background: "var(--accent-1)", color: "#fff", padding: "2px 8px", borderRadius: "10px" }}>{matchedTeachers.length} Matches</span>
              </div>
              
              {/* VIEW SWITCHER */}
              <div style={{ display: "flex", gap: "5px", background: "#f3f4f6", padding: "4px", borderRadius: "8px", flexWrap: "wrap" }}>
                <button 
                  onClick={() => setViewType("list")}
                  style={{ border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600", background: viewType === "list" ? "#fff" : "transparent", boxShadow: viewType === "list" ? "0 2px 4px rgba(0,0,0,0.1)" : "none" }}
                  title="Compact list view">
                  📋 List
                </button>
                <button 
                  onClick={() => setViewType("grid")}
                  style={{ border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600", background: viewType === "grid" ? "#fff" : "transparent", boxShadow: viewType === "grid" ? "0 2px 4px rgba(0,0,0,0.1)" : "none" }}
                  title="Card grid view">
                  🎴 Grid
                </button>
                <button 
                  onClick={() => setViewType("compact")}
                  style={{ border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600", background: viewType === "compact" ? "#fff" : "transparent", boxShadow: viewType === "compact" ? "0 2px 4px rgba(0,0,0,0.1)" : "none" }}
                  title="Compact profile view">
                  ⚡ Compact
                </button>
                <button 
                  onClick={() => setViewType("detailed")}
                  style={{ border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600", background: viewType === "detailed" ? "#fff" : "transparent", boxShadow: viewType === "detailed" ? "0 2px 4px rgba(0,0,0,0.1)" : "none" }}
                  title="Detailed card view">
                  📊 Detailed
                </button>
              </div>
            </div>

            {/* TEACHER LIST/GRID CONTAINER */}
            <div style={{ 
              display: viewType === "grid" || viewType === "detailed" ? "grid" : "flex", 
              flexDirection: viewType === "grid" || viewType === "detailed" ? "unset" : "column",
              gridTemplateColumns: viewType === "grid" ? "repeat(auto-fill, minmax(280px, 1fr))" : viewType === "detailed" ? "repeat(auto-fill, minmax(320px, 1fr))" : "unset",
              gap: viewType === "compact" ? "12px" : "15px" 
            }}>
              {matchedTeachers.map((teacher) => {
                const common = teacher.teacherDetails?.subjectsExpert.filter(s => user.studentDetails?.subjects.includes(s)) || [];
                const rating = teacher.teacherDetails?.averageRating || 0;

                return (
                  <div key={teacher._id} style={{ 
                    display: "flex", 
                    flexDirection: (viewType === "grid" || viewType === "detailed") ? "column" : "row",
                    justifyContent: "space-between", 
                    alignItems: (viewType === "grid" || viewType === "detailed") ? "center" : "center", 
                    padding: viewType === "compact" ? "12px" : "15px", 
                    border: "1px solid rgba(0,0,0,0.05)", 
                    borderRadius: "12px", 
                    gap: viewType === "compact" ? "10px" : "15px",
                    textAlign: (viewType === "grid" || viewType === "detailed") ? "center" : "left",
                    background: "white",
                    transition: "all 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                  }}
                  onMouseEnter={(e) => {e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"}}
                  onMouseLeave={(e) => {e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"}}>
                    
                    {viewType === "compact" ? (
                      // COMPACT VIEW - Single line with minimal info
                      <div style={{ display: "flex", flexDirection: "row", gap: "12px", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1, minWidth: 0 }}>
                          <img src={teacher.profilePic?.url || "/default-avatar.png"} style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-1)", flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: "700", fontSize: "13px" }}>{teacher.fullName}</div>
                            <div style={{ color: "#f1c40f", fontSize: "12px", marginTop: "2px" }}>{'★'.repeat(Math.round(rating))}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <button onClick={() => handleViewReviews(teacher)} style={{ background: "#f3f4f6", border: "1px solid #ddd", color: "#333", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.background = "#e5e7eb"}} onMouseLeave={(e) => {e.target.background = "#f3f4f6"}}>✓ Reviews</button>
                          <button onClick={() => handleHire(teacher)} style={{ background: "var(--accent-1)", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.opacity = "0.9"}} onMouseLeave={(e) => {e.target.opacity = "1"}}>💼 Hire</button>
                        </div>
                      </div>
                    ) : (
                      // ORIGINAL / GRID / DETAILED VIEW
                      <>
                        <div style={{ display: "flex", flexDirection: (viewType === "grid" || viewType === "detailed") ? "column" : "row", gap: "15px", alignItems: "center", width: "100%" }}>
                          <img src={teacher.profilePic?.url || "/default-avatar.png"} style={{ width: (viewType === "grid" || viewType === "detailed") ? "70px" : "55px", height: (viewType === "grid" || viewType === "detailed") ? "70px" : "55px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-1)" }} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: (viewType === 'grid' || viewType === 'detailed') ? 'center' : 'flex-start', gap: '8px', fontWeight: '700' }}>
                              <span>{teacher.fullName}</span>
                              {teacher.membership === 'teacher_premium' && (
                                <span style={{ background: '#fde68a', color: '#92400e', fontSize: '10px', padding: '2px 6px', borderRadius: '999px', fontWeight: '700' }}>Premium</span>
                              )}
                            </div>
                            <div style={{ color: "#f1c40f", fontSize: "14px", margin: "2px 0" }}>
                              {"★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating))}
                              <span className="muted" style={{ fontSize: "11px", marginLeft: "5px", color: "var(--muted)" }}>({teacher.teacherDetails?.totalReviews || 0})</span>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: (viewType === "grid" || viewType === "detailed") ? "center" : "flex-start", marginTop: "8px" }}>
                              {common.slice(0, viewType === "detailed" ? 5 : 3).map(s => (
                                <span key={s} style={{ fontSize: "9px", background: "rgba(201, 163, 94, 0.1)", color: "var(--accent-1)", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px", width: (viewType === "grid" || viewType === "detailed") ? "100%" : "auto", justifyContent: "center", flexWrap: "wrap", marginTop: viewType === "list" ? "0" : "10px" }}>
                          <button onClick={() => handleViewReviews(teacher)} style={{ flex: (viewType === "grid" || viewType === "detailed") ? 1 : "none", background: "#f3f4f6", border: "1px solid #ddd", color: "#333", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.style.background = "#e5e7eb"}} onMouseLeave={(e) => {e.target.style.background = "#f3f4f6"}}>Reviews</button>
                          <button onClick={() => { setSelectedTeacher(teacher); setShowRatingModal(true); }} style={{ flex: (viewType === "grid" || viewType === "detailed") ? 1 : "none", background: "transparent", border: "1px solid var(--muted)", color: "var(--muted)", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.style.background = "rgba(139,121,104,0.05)"}} onMouseLeave={(e) => {e.target.style.background = "transparent"}}>Rate</button>
                          <button onClick={() => (window.location.href = "/chats")} style={{ flex: (viewType === "grid" || viewType === "detailed") ? 1 : "none", background: "transparent", border: "1px solid var(--accent-1)", color: "var(--accent-1)", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.style.background = "rgba(201,163,94,0.1)"}} onMouseLeave={(e) => {e.target.style.background = "transparent"}}>Chat</button>
                          <button onClick={() => handleHire(teacher)} style={{ flex: (viewType === "grid" || viewType === "detailed") ? 1 : "none", background: "var(--accent-1)", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.style.opacity = "0.9"}} onMouseLeave={(e) => {e.target.style.opacity = "1"}}>Hire</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {user.registrationType === "teacher" && (
          <div className="card" style={{ marginTop: "20px", padding: "20px" }}>
            <h3>High-paying Student Suggestions</h3>
            {teacherSuggestions.length === 0 ? (
              <p style={{ color: "#6b7280", marginTop: "10px" }}>No suggestions available. Purchase Teacher Premium to unlock student leads.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, marginTop: "10px" }}>
                {teacherSuggestions.map((student) => (
                  <li key={student._id} style={{ marginBottom: "12px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                    <strong>{student.fullName}</strong> • {student.email} • {student.phone}
                    <div style={{ fontSize: "12px", color: "#4b5563" }}>Standard: {student.studentDetails?.standard || "N/A"} • Matched subjects: {student.matchingSubjectsCount}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* --- REVIEWS MODAL --- */}
        {showReviewsModal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100, padding: "20px" }}>
            <div className="card" style={{ width: "100%", maxWidth: "450px", maxHeight: "85vh", overflowY: "auto", background: "white", borderRadius: "12px", padding: "20px", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{selectedTeacher?.fullName}'s Reviews</h3>
                <button onClick={() => setShowReviewsModal(false)} style={{ border: "none", background: "none", fontSize: "22px", cursor: "pointer", color: "#666" }}>✕</button>
              </div>

              {loadingReviews ? (
                <Loader message="Loading feedback..." className="mx-auto" />
              ) : reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 10px" }}>
                  <p className="muted">No reviews yet. Be the first to rate!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                   <div style={{ background: "#f9f9f9", padding: "12px", borderRadius: "10px", textAlign: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>{selectedTeacher?.teacherDetails?.averageRating}</span>
                      <span style={{ color: "#f1c40f", marginLeft: "5px", fontSize: "20px" }}>★</span>
                      <div className="muted" style={{ fontSize: "12px" }}>Based on {reviews.length} reviews</div>
                   </div>

                  {reviews.map((r) => (
                    <div key={r._id} style={{ borderBottom: "1px solid #f1f1f1", paddingBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                           <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--accent-1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>
                              {r.student?.fullName?.charAt(0) || "S"}
                           </div>
                           <span style={{ fontWeight: "600", fontSize: "13px" }}>{r.student?.fullName || "Verified Student"}</span>
                        </div>
                        <span style={{ color: "#f1c40f", fontSize: "12px" }}>{"★".repeat(r.rating)}</span>
                      </div>
                      <p style={{ fontSize: "13px", margin: "8px 0", color: "#444", lineHeight: "1.4" }}>{r.comment}</p>
                      <small style={{ color: "#bbb", fontSize: "10px" }}>{new Date(r.createdAt).toLocaleDateString()}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- RATING MODAL --- */}
        {showRatingModal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200 }}>
            <div className="card" style={{ width: "320px", padding: "25px", textAlign: "center", background: "white", borderRadius: "12px" }}>
              <h4 style={{ marginBottom: "10px", color: "#333" }}>Rate {selectedTeacher?.fullName}</h4>
              <div style={{ margin: "15px 0" }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <span 
                    key={num} 
                    onClick={() => setRatingValue(num)} 
                    style={{ fontSize: "30px", cursor: "pointer", color: num <= ratingValue ? "#f1c40f" : "#ccc", padding: "0 2px" }}>
                    ★
                  </span>
                ))}
              </div>
              <textarea 
                placeholder="How was your experience?" 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                style={{ width: "100%", borderRadius: "8px", padding: "10px", minHeight: "80px", marginBottom: "15px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }} 
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowRatingModal(false)} style={{ flex: 1, background: "#eee", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", color: "#333" }}>Cancel</button>
                <button onClick={handleRateSubmit} style={{ flex: 1, background: "var(--accent-1)", color: "white", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Submit</button>
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ textAlign: "center", padding: "30px" }}>
          <div style={{ fontSize: "2rem" }}>🚀</div>
          <h3>Platform Features Coming Soon</h3>
          <p className="muted">Direct hiring and course materials are under development.</p>
        </div>
      </main>
    </div>
  );
}