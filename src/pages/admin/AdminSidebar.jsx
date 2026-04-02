import { Link, useLocation, useNavigate } from "react-router-dom";

export default function AdminSidebar({ isSidebarOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menus = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Students", path: "/admin/students" },
    { name: "Teachers", path: "/admin/teachers" },
    { name: "Chapters", path: "/admin/chapters" },
    { name: "Leave Management", path: "/admin/leaves" },
    { name: "User Requests", path: "/admin/user-requests" },
    { name: "Landing Page", path: "/admin/landing-page" },
    { name: "App Settings", path: "/admin/app-settings" }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    // Add the "open" class if isSidebarOpen is true
    <div className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
      <h3 className="admin-logo">Admin Panel</h3>

      {menus.map((m) => (
        <Link
          key={m.path}
          to={m.path}
          // Close sidebar on mobile when a link is clicked
          onClick={() => { if(window.innerWidth <= 900) toggleSidebar(false); }}
          className={
            location.pathname === m.path
              ? "admin-link active"
              : "admin-link"
          }
        >
          {m.name}
        </Link>
      ))}

      <button className="admin-logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}