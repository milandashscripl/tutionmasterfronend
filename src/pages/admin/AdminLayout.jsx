import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {

  return (
    <div className="admin-container">

      <AdminSidebar />

      <div className="admin-content">
        {children}
      </div>

    </div>
  );
}