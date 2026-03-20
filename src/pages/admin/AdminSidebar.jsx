import { Link, useLocation, useNavigate } from "react-router-dom";

export default function AdminSidebar() {

  const location = useLocation();
  const navigate = useNavigate();

  const menus = [
    { name: "Dashboard", path: "/admin" },
    { name: "User Requests", path: "/admin/user-requests" },
    { name: "App Settings", path: "/admin/app-settings" } // fixed
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="admin-sidebar">

      <h3 className="admin-logo">Admin Panel</h3>

      {menus.map((m) => (

        <Link
          key={m.path}
          to={m.path}
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