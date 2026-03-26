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
import UserRequests from "./pages/admin/UserRequests";
import AppSettings from "./pages/admin/AdminSettings";
import LandingPage from "./pages/LandingPage";

export default function App() {
  // NEW: State for global site settings
  const [siteSettings, setSiteSettings] = useState({
    logoUrl: "",
    siteName: "TuitionMaster"
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      return window.innerWidth > 900;
    } catch {
      return true;
    }
  });

  // NEW: Fetch settings on app load
  useEffect(() => {
    API.get("/settings")
      .then((res) => {
        if (res.data) {
          setSiteSettings({
            logoUrl: res.data.logo?.url || "",
            siteName: res.data.siteName || "TuitionMaster"
          });
        }
      })
      .catch((err) => console.error("Failed to load site settings", err));
  }, []);

  const toggleSidebar = (val) => {
    if (typeof val === "boolean") setIsSidebarOpen(val);
    else setIsSidebarOpen((s) => !s);
  };

  return (
    <BrowserRouter>
      <div className="app-wrap">
        {/* Pass siteSettings to Header */}
        <HeaderComp toggleSidebar={toggleSidebar} siteSettings={siteSettings} />

        <Routes>
          {/* AUTH ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/reset" element={<Reset />} />

          {/* USER PANEL */}
          <Route
            path="/dashboard"
            element={<Dashboard isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
          />
          <Route
            path="/chats"
            element={<Chats isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
          />
          <Route
            path="/courses"
            element={<Courses isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
          />
          <Route
            path="/profile"
            element={<Profile isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
          />
          <Route
            path="/settings"
            element={<Settings isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
          />

          {/* ADMIN PANEL */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="user-requests" element={<UserRequests />} />
            <Route path="app-settings" element={<AppSettings />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

/* ================= HEADER COMPONENT ================= */

function HeaderComp({ toggleSidebar, siteSettings }) {
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
      <div className="brand" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button className="hamburger" onClick={() => toggleSidebar()}>
          ☰
        </button>

        {/* LOGIC: Only show image if logoUrl exists. No text fallback. */}
        {siteSettings.logoUrl && (
          <img
            src={siteSettings.logoUrl}
            alt="App Logo"
            style={{ 
              height: "40px", 
              width: "auto", 
              objectFit: "contain",
              cursor: "pointer" 
            }}
            onClick={() => window.location.href = "/dashboard"}
          />
        )}
      </div>

      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {user.profilePic?.url ? (
            <img
              src={user.profilePic.url}
              alt="profile"
              style={{
                width: 35,
                height: 35,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 35,
                height: 35,
                borderRadius: "50%",
                background: "#4f46e5",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
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