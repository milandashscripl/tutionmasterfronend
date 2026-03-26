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

/* API UTILS */
import API from "./api/api";

export default function App() {
  // Global site settings state (Logo and Name)
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

  // Fetch Branding Settings from Backend on App Load
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
        {/* Navbar component with dynamic branding */}
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
  const navigate = useNavigate(); // For SPA navigation
  const [user, setUser] = useState(null);

  // Hide header on Auth pages
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
      <div className="brand" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button className="hamburger" onClick={() => toggleSidebar()}>
          ☰
        </button>

        {/* Dynamic Logo: Only shows if a URL is present in database */}
        {siteSettings.logoUrl && (
          <img
            src={siteSettings.logoUrl}
            alt="Logo"
            style={{ 
              height: "40px", 
              width: "auto", 
              objectFit: "contain", 
              cursor: "pointer" 
            }}
            onClick={() => navigate("/dashboard")}
          />
        )}
      </div>

      {user && (
        <div className="header-user-badge" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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