import React from "react";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "chats", label: "Chats", icon: "💬" },
  { key: "courses", label: "Courses", icon: "📚" },
  { key: "profile", label: "Profile", icon: "👤" },
  { key: "update", label: "Update", icon: "⚙️" },
];

function initialsOf(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Sidebar({ user, onEdit, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="profile-block">
          <div className="avatar-wrap">
            {user?.profilePic?.url ? (
              <img src={user.profilePic.url} alt="profile" />
            ) : (
              <div className="avatar-initial">{initialsOf(user?.fullName)}</div>
            )}
          </div>

          <div className="profile-meta">
            <div className="profile-name">{user?.fullName}</div>
            <div className="profile-role">{user?.registrationType || "Student"}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((it) => (
            <button key={it.key} className="nav-item" onClick={() => onNavigate(it.key)}>
              <span className="nav-icon">{it.icon}</span>
              <span className="nav-label">{it.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={() => onNavigate("logout")}>Logout</button>
        </div>
      </div>
    </aside>
  );
}
