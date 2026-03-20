import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "🏠", path: "/dashboard" },
  { key: "chats", label: "Chats", icon: "💬", path: "/chats" },
  { key: "courses", label: "Courses", icon: "📚", path: "/courses" },
  { key: "profile", label: "Profile", icon: "👤", path: "/profile" },
  { key: "settings", label: "Settings", icon: "⚙️", path: "/settings" },
];

function initialsOf(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) return parts[0][0].toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Sidebar({ user, isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const handleProfileClick = () => {
    navigate("/profile");
    if (onClose) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
    window.location.reload();
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-inner">

        {/* PROFILE SECTION */}
        <div className="profile-block" onClick={handleProfileClick}>
          <div className="avatar-wrap">
            {user?.profilePic?.url ? (
              <img src={user.profilePic.url} alt="profile" />
            ) : (
              <div className="avatar-initial">
                {initialsOf(user?.fullName || user?.name)}
              </div>
            )}
          </div>

          <div className="profile-meta">
            <div className="profile-name">
              {user?.fullName || user?.name || "User"}
            </div>

            <div className="profile-role">
              {user?.role || user?.registrationType || "Student"}
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={() => handleNavigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </aside>
  );
}