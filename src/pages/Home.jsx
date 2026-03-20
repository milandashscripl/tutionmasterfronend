import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Home({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [matchedTeachers, setMatchedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ADDED RATING STATES ---
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
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
          setMatchedTeachers(matchRes.data);
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

  // --- ADDED RATING SUBMIT FUNCTION ---
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
      // Refresh the matches to update the stars on the UI
      const matchRes = await API.get("/user/matches");
      setMatchedTeachers(matchRes.data);
    } catch (err) {
      alert("Failed to submit rating: " + (err.response?.data?.message || err.message));
    }
  };

  const handleHire = async (teacherId) => {
    try {
      await API.post("/user/hire", { teacherId });
      alert("Hiring request sent!");
    } catch (err) {
      alert("Failed to hire: " + err.message);
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

  if (loading || !user) return <div className="card">Loading...</div>;

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
        </div>

        {/* MATCHED TEACHERS SECTION */}
        {user.registrationType === "student" && (
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3>Recommended Teachers</h3>
              <span style={{ fontSize: "12px", background: "var(--accent-1)", color: "#fff", padding: "2px 8px", borderRadius: "10px" }}>{matchedTeachers.length} Matches</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {matchedTeachers.map((teacher) => {
                const common = teacher.teacherDetails?.subjectsExpert.filter(s => user.studentDetails?.subjects.includes(s)) || [];
                const rating = teacher.teacherDetails?.averageRating || 0;

                return (
                  <div key={teacher._id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", padding: "15px", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "12px", gap: "15px" }}>
                    
                    <div style={{ display: "flex", gap: "15px", alignItems: "center", minWidth: "250px" }}>
                      <img src={teacher.profilePic?.url || "/default-avatar.png"} style={{ width: "55px", height: "55px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-1)" }} />
                      <div>
                        <div style={{ fontWeight: "700" }}>{teacher.fullName}</div>
                        <div style={{ color: "#f1c40f", fontSize: "14px", margin: "2px 0" }}>
                          {"★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating))}
                          <span className="muted" style={{ fontSize: "11px", marginLeft: "5px", color: "var(--muted)" }}>({teacher.teacherDetails?.totalReviews || 0})</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {common.slice(0, 3).map(s => (
                            <span key={s} style={{ fontSize: "9px", background: "rgba(201, 163, 94, 0.1)", color: "var(--accent-1)", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      <button 
                        onClick={() => { setSelectedTeacher(teacher); setShowRatingModal(true); }}
                        style={{ background: "transparent", border: "1px solid var(--muted)", color: "var(--muted)", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
                        Rate
                      </button>
                      <button onClick={() => (window.location.href = "/chats")} style={{ background: "transparent", border: "1px solid var(--accent-1)", color: "var(--accent-1)", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Chat</button>
                      <button onClick={() => handleHire(teacher._id)} style={{ background: "var(--accent-1)", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Hire</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- RATING MODAL --- */}
        {showRatingModal && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
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