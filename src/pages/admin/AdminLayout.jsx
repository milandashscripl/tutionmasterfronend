import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout(){

  return(
    <div className="admin-container">

      <AdminSidebar/>

      <div className="admin-content">
        <Outlet/>
      </div>

    </div>
  );
}