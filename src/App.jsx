import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

/* PAGE IMPORTS */
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
import LandingPage from "./pages/LandingPage";

/* ADMIN IMPORTS */
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserRequests from "./pages/admin/UserRequests";
import AppSettings from "./pages/admin/AdminSettings";
import AdminLandingPage from "./pages/admin/AdminLandingPage";

/* API UTILS */
import API from "./api/api";

export default function App() {
  // --- UPDATED STATE: Includes themeColor for global consistency ---
  const [siteSettings, setSiteSettings] = useState({
    logoUrl: "",
    siteName: "TuitionMaster",
    themeColor: "#c9a35e"
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      return window.innerWidth > 900;
    } catch {
      return true;
    }
  });

  // Fetch Branding Settings from Backend on App Load
  useEffect(() => {
    // Note: Ensure this endpoint matches your backend route (/admin/settings/public)
    API.get("/admin/settings/public")
      .then((res) => {
        if (res.data) {
          setSiteSettings({
            logoUrl: res.data.logo?.url || "",
            logo: { url: res.data.logo?.url || "" },
            siteName: res.data.siteName || "TuitionMaster",
            themeColor: res.data.themeColor || "#c9a35e"
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
            <Route path="landing-page" element={<AdminLandingPage />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

/* ================= HEADER COMPONENT ================= */

function HeaderComp({ toggleSidebar, siteSettings }) {
  const location = useLocation();
  const navigate = useNavigate(); 
  const [user, setUser] = useState(null);

  const hideHeader = ["/", "/login", "/register", "/verify", "/forgot", "/reset"].includes(location.pathname);

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
      <div className="brand" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button className="hamburger" onClick={() => toggleSidebar()}>
          ☰
        </button>

        {/* --- DYNAMIC LOGO LOGIC --- */}
        <div onClick={() => navigate("/dashboard")} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
          {siteSettings.logoUrl ? (
            <img
              src={siteSettings.logoUrl}
              alt="Logo"
              style={{ 
                height: "35px", 
                width: "auto", 
                objectFit: "contain"
              }}
            />
          ) : (
            // Fallback to text if no logo is uploaded
            <h2 style={{ margin: 0, fontSize: "1.2rem", color: siteSettings.themeColor }}>
              {siteSettings.siteName}
            </h2>
          )}
        </div>
      </div>

      {user && (
        <div className="header-user-badge" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>{user.fullName}</span>
          {user.profilePic?.url ? (
            <img
              src={user.profilePic.url}
              alt="profile"
              style={{
                width: 35,
                height: 35,
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${siteSettings.themeColor}`
              }}
            />
          ) : (
            <div
              style={{
                width: 35,
                height: 35,
                borderRadius: "50%",
                background: siteSettings.themeColor,
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