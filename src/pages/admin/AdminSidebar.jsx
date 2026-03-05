import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {

  const location = useLocation();

  const menus = [
    { name: "Dashboard", path: "/admin" },
    { name: "Add Student", path: "/admin/add-student" },
    { name: "Add Teacher", path: "/admin/add-teacher" },
    { name: "Remove Student", path: "/admin/remove-student" },
    { name: "Remove Teacher", path: "/admin/remove-teacher" },
    { name: "User Requests", path: "/admin/user-requests" },
    { name: "Accepted Requests", path: "/admin/accepted-requests" },
    { name: "Settings", path: "/admin/settings" },
  ];

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

    </div>
  );
}