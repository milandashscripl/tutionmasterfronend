import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function initialsOf(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) return parts[0][0].toUpperCase();

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Sidebar({ user, isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamic navigation based on user role
  const getNavItems = () => {
    const baseItems = [
      { key: "home", label: "Home", icon: "🏠", path: "/dashboard" },
      { key: "chats", label: "Chats", icon: "💬", path: "/chats" },
      { key: "courses", label: "Courses", icon: "📚", path: "/courses" },
    ];

    const role = user?.role || user?.registrationType;

    if (role === 'student') {
      return [
        ...baseItems,
        { key: "attendance", label: "My Attendance", icon: "📊", path: "/attendance" },
        { key: "payments", label: "My Payments", icon: "💳", path: "/payments" },
        { key: "profile", label: "Profile", icon: "👤", path: "/profile" },
        { key: "settings", label: "Settings", icon: "⚙️", path: "/settings" },
      ];
    } else if (role === 'teacher') {
      return [
        ...baseItems,
        { key: "attendance", label: "Attendance", icon: "📊", path: "/teacher-attendance" },
        { key: "payments", label: "Payments", icon: "💳", path: "/teacher-payments" },
        { key: "leaves", label: "Leave Requests", icon: "📅", path: "/leave-requests" },
        { key: "profile", label: "Profile", icon: "👤", path: "/profile" },
        { key: "settings", label: "Settings", icon: "⚙️", path: "/settings" },
      ];
    } else if (role === 'admin') {
      return [
        { key: "home", label: "Dashboard", icon: "🏠", path: "/admin-dashboard" },
        { key: "students", label: "Students", icon: "👨‍🎓", path: "/admin/students" },
        { key: "teachers", label: "Teachers", icon: "👨‍🏫", path: "/admin/teachers" },
        { key: "chapters", label: "Chapters", icon: "📖", path: "/admin/chapters" },
        { key: "leaves", label: "Leave Management", icon: "📅", path: "/admin/leaves" },
        { key: "requests", label: "User Requests", icon: "📋", path: "/admin/requests" },
        { key: "settings", label: "Settings", icon: "⚙️", path: "/admin/settings" },
      ];
    }

    return [
      ...baseItems,
      { key: "profile", label: "Profile", icon: "👤", path: "/profile" },
      { key: "settings", label: "Settings", icon: "⚙️", path: "/settings" },
    ];
  };

  const NAV_ITEMS = getNavItems();

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