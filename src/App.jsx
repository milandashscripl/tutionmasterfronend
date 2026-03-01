import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
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

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    try {
      return window.innerWidth > 900;
    } catch (e) {
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
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/dashboard" element={<Dashboard isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
            <Route path="/chats" element={<Chats isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
            <Route path="/courses" element={<Courses isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
            <Route path="/profile" element={<Profile isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
            <Route path="/settings" element={<Settings isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
          </Routes>
        </div>
    </BrowserRouter>
  );
}

function HeaderComp({ toggleSidebar }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const hideHeader = ["/", "/register", "/verify", "/forgot", "/reset"].includes(location.pathname);
  const isDashboard = ["/dashboard", "/chats", "/courses", "/profile", "/settings"].includes(location.pathname);
  
  useEffect(() => {
    if (isDashboard) {
      API.get("/user/me").then((res) => setUser(res.data)).catch(() => { });
    }
  }, [isDashboard]);

  if (hideHeader) return null;
}