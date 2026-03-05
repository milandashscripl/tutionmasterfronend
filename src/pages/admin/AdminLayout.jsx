import { Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      <div style={{ width: "250px", background: "#111", color: "#fff", padding: "20px" }}>
        <h2>Admin Panel</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/add-student">Add Student</Link>
          <Link to="/admin/add-teacher">Add Teacher</Link>
          <Link to="/admin/remove-student">Remove Student</Link>
          <Link to="/admin/remove-teacher">Remove Teacher</Link>
          <Link to="/admin/user-requests">User Requests</Link>
          <Link to="/admin/accepted-requests">Accepted Requests</Link>
        </nav>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "30px" }}>
        <Outlet />
      </div>

    </div>
  );
}