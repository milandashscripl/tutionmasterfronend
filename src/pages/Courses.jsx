import { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Courses({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);

  // Load user
  useEffect(() => {
    API.get("/user/me")
      .then((res) => setUser(res.data))
      .catch(() => (window.location.href = "/"));
  }, []);

  if (!user) return <div className="card">Loading...</div>;

  return (
    <div className="layout">
      {/* Sidebar Overlay */}
      <div
        className={"overlay " + (isSidebarOpen ? "open" : "")}
        onClick={() => toggleSidebar && toggleSidebar(false)}
      />

      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar && toggleSidebar(false)}
      />

      <main className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="coming-soon-text">Coming Soon...</h1>
          <p className="muted" style={{ animation: "welcomeFade 1.5s ease forwards", opacity: 0 }}>
            Our expert-led courses are currently under construction.
          </p>
          <div className="loader-line"></div>
        </div>
      </main>
    </div>
  );
}