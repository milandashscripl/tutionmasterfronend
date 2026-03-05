import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import Forgot from "./pages/Forgot";
import Reset from "./pages/Reset";
import Profile from "./pages/Profile";
import Chats from "./pages/Chats";
import Courses from "./pages/Courses";
import Settings from "./pages/Settings";

import API from "./api/api";

/* ADMIN IMPORTS */
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AddStudent from "./pages/admin/AddStudent";
import AddTeacher from "./pages/admin/AddTeacher";
import RemoveStudent from "./pages/admin/RemoveStudent";
import RemoveTeacher from "./pages/admin/RemoveTeacher";
import UserRequests from "./pages/admin/UserRequests";
import AcceptedRequests from "./pages/admin/AcceptedRequests";

export default function App() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      return window.innerWidth > 900;
    } catch {
      return true;
    }
  });

  const toggleSidebar = (val) => {
    if (typeof val === "boolean") setIsSidebarOpen(val);
    else setIsSidebarOpen((s) => !s);
  };

  return (
    <BrowserRouter>

      <div className="app-wrap">

        <HeaderComp toggleSidebar={toggleSidebar} />

        <Routes>

          {/* AUTH */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/reset" element={<Reset />} />

          {/* USER PANEL */}
          <Route path="/dashboard" element={<Dashboard isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
          <Route path="/chats" element={<Chats isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
          <Route path="/courses" element={<Courses isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
          <Route path="/profile" element={<Profile isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
          <Route path="/settings" element={<Settings isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />

          {/* ADMIN PANEL */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/add-student"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AddStudent />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/add-teacher"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AddTeacher />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/remove-student"
            element={
              <AdminRoute>
                <AdminLayout>
                  <RemoveStudent />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/remove-teacher"
            element={
              <AdminRoute>
                <AdminLayout>
                  <RemoveTeacher />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/user-requests"
            element={
              <AdminRoute>
                <AdminLayout>
                  <UserRequests />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/accepted-requests"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AcceptedRequests />
                </AdminLayout>
              </AdminRoute>
            }
          />

        </Routes>

      </div>

    </BrowserRouter>
  );
}


/* ===============================
   HEADER COMPONENT
================================ */

function HeaderComp({ toggleSidebar }) {

  const location = useLocation();
  const [user, setUser] = useState(null);

  const hideHeader = ["/", "/register", "/verify", "/forgot", "/reset"].includes(location.pathname);

 const isDashboard =
  location.pathname.startsWith("/dashboard") ||
  location.pathname.startsWith("/chats") ||
  location.pathname.startsWith("/courses") ||
  location.pathname.startsWith("/profile") ||
  location.pathname.startsWith("/settings") ||
  location.pathname.startsWith("/admin");

  useEffect(() => {

    if (isDashboard) {
      API.get("/user/me")
        .then((res) => setUser(res.data))
        .catch(() => {});
    }

  }, [isDashboard]);

  if (hideHeader) return null;

  return (
    <header className="brand-header">

      <div className="brand">

        <button
          className="hamburger"
          onClick={() => toggleSidebar()}
        >
          ☰
        </button>

        <h2>TuitionMaster</h2>

      </div>

      {user && (
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>

          {user.profilePic?.url ? (
            <img
              src={user.profilePic.url}
              alt="profile"
              style={{
                width:35,
                height:35,
                borderRadius:"50%",
                objectFit:"cover"
              }}
            />
          ) : (
            <div
              style={{
                width:35,
                height:35,
                borderRadius:"50%",
                background:"#4f46e5",
                color:"#fff",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                fontWeight:"bold"
              }}
            >
              {user.fullName?.[0]?.toUpperCase()}
            </div>
          )}

        </div>
      )}

    </header>
  );
}