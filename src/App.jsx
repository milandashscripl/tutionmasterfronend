import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import Forgot from "./pages/Forgot";
import Reset from "./pages/Reset";
import Profile from "./pages/Profile";

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
        <div style={{ width: "100%", maxWidth: 1100 }}>
          {/* Header is rendered conditionally inside HeaderComp so auth pages remain clean */}
          <HeaderComp toggleSidebar={toggleSidebar} />

          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/dashboard" element={<Dashboard isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

function HeaderComp({ toggleSidebar }) {
  const location = useLocation();
  const hideHeader = ["/", "/register", "/verify", "/forgot", "/reset"].includes(location.pathname);
  if (hideHeader) return null;

  return (
    <header className="brand-header">
      <div className="brand">
        <button className="hamburger" onClick={() => toggleSidebar()} aria-label="Toggle sidebar">
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
        <div className="logo" aria-hidden />
        <div>
          <h1>TuitionMaster</h1>
          <p className="muted">Teach. Learn. Grow.</p>
        </div>
      </div>

      <nav className="top-nav">
        <Link to="/" className="link">Sign in</Link>
        <Link to="/register" className="link">Register</Link>
        <a href="#about" className="link">About us</a>
        <a href="#contact" className="link">Contact Us</a>

        <div className="profile-menu-wrapper">
          <button className="profile-button" aria-label="Profile">
            <div className="avatar">U</div>
          </button>
          <div className="profile-dropdown">
            <Link to="/profile" className="dropdown-item">Go to profile</Link>
            <button className="dropdown-item" onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}>Logout</button>
          </div>
        </div>
      </nav>
    </header>
  );
}