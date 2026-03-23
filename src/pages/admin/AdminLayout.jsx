import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ isSidebarOpen, toggleSidebar }) {
  return (
    <div className="admin-container">
      {/* 1. Mobile Overlay: clicking this closes the sidebar */}
      <div 
        className={`overlay ${isSidebarOpen ? "open" : ""}`} 
        onClick={() => toggleSidebar(false)}
      ></div>

      {/* 2. Admin Sidebar: receives the open state */}
      <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}