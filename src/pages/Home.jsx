import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";

function HomeContent({ view, user }) {
  if (view === "home") return <div className="card"><h3>Welcome, {user?.fullName}</h3><p className="muted">This is your dashboard home.</p></div>;
  if (view === "chats") return <div className="card"><h3>Chats</h3><p className="muted">Chat list coming soon.</p></div>;
  if (view === "courses") return <div className="card"><h3>Courses</h3><p className="muted">Your courses will appear here.</p></div>;
  if (view === "profile") return <div className="card"><h3>Profile</h3><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(user, null, 2)}</pre></div>;
  if (view === "update") return <div className="card"><h3>Update</h3><p className="muted">Use the sidebar picture edit or profile update form.</p></div>;
  return null;
}

export default function Home({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const fileRef = useRef();

  useEffect(() => {
    API.get("/user/me").then((res) => setUser(res.data)).catch(() => { localStorage.removeItem("token"); window.location.href = "/"; });
  }, []);

  const handleEditPic = () => fileRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append("profilePic", file);
    try {
      const res = await API.put("/me", data, { headers: { "Content-Type": "multipart/form-data" } });
      setUser(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  const handleNavigate = (to) => {
    if (to === "logout") { localStorage.removeItem("token"); window.location.href = "/"; return; }
    setView(to);
    // close sidebar on small screens after navigating
    if (window.innerWidth <= 900 && typeof toggleSidebar === "function") toggleSidebar(false);
  };

  if (!user) return <div className="card">Loading...</div>;

  return (
    <div className="layout">
      {/* overlay for mobile when sidebar open */}
      <div className={"overlay " + (isSidebarOpen ? "open" : "")} onClick={() => toggleSidebar && toggleSidebar(false)} />

      <div className={"sidebar " + (isSidebarOpen ? "" : "closed")}>
        <Sidebar user={user} onEdit={handleEditPic} onNavigate={handleNavigate} />
      </div>

      <main className="main">
        <div className="hero">
          <div className="lead">
            <h2>Welcome back, {user.fullName.split(" ")[0]}</h2>
            <p className="muted">Good to see you — manage your classes, chats and profile from here.</p>
          </div>
          <div className="cta">
            <button onClick={() => setView("courses")} style={{ background: 'linear-gradient(90deg,var(--accent-1),var(--accent-2))' }}>Browse Courses</button>
            <button onClick={() => setView("chats")} style={{ background: "transparent", border: "1px solid rgba(15,23,36,0.06)", color: "var(--text)" }}>Open Chats</button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>Courses</h4>
            <div className="stat-number">{user.courses?.length || 0}</div>
            <div className="muted">Enrolled</div>
          </div>
          <div className="stat-card">
            <h4>Messages</h4>
            <div className="stat-number">{user.messagesCount || 0}</div>
            <div className="muted">Unread</div>
          </div>
          <div className="stat-card">
            <h4>Joined</h4>
            <div className="stat-number">{new Date(user.createdAt).getFullYear()}</div>
            <div className="muted">Member since</div>
          </div>
        </div>

        <div className="card-grid">
          <div>
            <div className="recent-card">
              <h3>Recent activity</h3>
              <div style={{ marginTop: 12 }}>
                {["Joined a course", "Completed lesson 2", "Received message from Admin"].map((t, i) => (
                  <div className="recent-item" key={i}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(15,23,36,0.03)" }}>{i+1}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t}</div>
                      <div className="muted" style={{ fontSize: 12 }}>a few minutes ago</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <h3>Profile summary</h3>
              <div style={{ marginTop: 12 }}>
                <p><strong>Name:</strong> {user.fullName}</p>
                <p className="muted"><strong>Email:</strong> {user.email}</p>
                <p className="muted"><strong>Phone:</strong> {user.phone}</p>
                <div style={{ marginTop: 10 }}>
                  <button onClick={() => setView("profile")}>View Profile</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
    </div>
  );
}
