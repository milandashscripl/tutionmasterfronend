import { useEffect, useState } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Settings({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    API.get("/user/me").then((res) => setUser(res.data)).catch(() => { window.location.href = "/"; });

    // Load saved settings from localStorage
    const savedTheme = localStorage.getItem("appTheme") || "light";
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setTheme(savedTheme);
    setDarkMode(savedDarkMode);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("appTheme", newTheme);
    updateCSSTheme(newTheme);
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    applyDarkMode(newDarkMode);
  };

  const updateCSSTheme = (themeName) => {
    const themes = {
      light: {
        "--bg": "#faf9f7",
        "--accent-1": "#c9a35e",
        "--muted": "#8b7968",
        "--text": "#1f1e1c",
      },
      blue: {
        "--bg": "#f0f4f8",
        "--accent-1": "#4a90e2",
        "--muted": "#627394",
        "--text": "#1a202c",
      },
      green: {
        "--bg": "#f0f8f4",
        "--accent-1": "#48bb78",
        "--muted": "#4a7c59",
        "--text": "#1e3a1f",
      },
      purple: {
        "--bg": "#f5f3f8",
        "--accent-1": "#9f7aea",
        "--muted": "#6b5b95",
        "--text": "#2d1b4e",
      },
    };

    const selectedTheme = themes[themeName] || themes.light;
    Object.keys(selectedTheme).forEach((key) => {
      document.documentElement.style.setProperty(key, selectedTheme[key]);
    });
  };

  const applyDarkMode = (isDark) => {
    if (isDark) {
      document.body.style.backgroundColor = "#1a1a1a";
      document.body.style.color = "#f0f0f0";
    } else {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await API.put("/user/settings", {
        theme,
        darkMode,
        notifications,
      });
      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      setSaveMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="card">Loading...</div>;

  const themes = [
    { name: "light", label: "Light", color: "#faf9f7" },
    { name: "blue", label: "Blue", color: "#4a90e2" },
    { name: "green", label: "Green", color: "#48bb78" },
    { name: "purple", label: "Purple", color: "#9f7aea" },
  ];

  return (
    <div className="layout">
      <div className={"overlay " + (isSidebarOpen ? "open" : "")} onClick={() => toggleSidebar && toggleSidebar(false)} />
      <div className={"sidebar " + (isSidebarOpen ? "open" : "closed")}>
        <Sidebar user={user} onNavigate={() => {}} />
      </div>

      <main className="main" style={{ width: "100%" }}>
        <div className="hero">
          <div className="lead">
            <h2>Settings</h2>
            <p className="muted">Customize your experience with TuitionMaster</p>
          </div>
        </div>

        <div style={{ maxWidth: "600px" }}>
          {saveMessage && (
            <div style={{
              padding: "12px 16px",
              marginBottom: "20px",
              borderRadius: "10px",
              backgroundColor: saveMessage.includes("success") ? "rgba(72,187,120,0.1)" : "rgba(201,163,94,0.1)",
              color: saveMessage.includes("success") ? "#2f855a" : "var(--accent-1)",
              border: `1px solid ${saveMessage.includes("success") ? "#9ae6b4" : "rgba(201,163,94,0.3)"}`,
            }}>
              {saveMessage}
            </div>
          )}

          {/* Theme Selection */}
          <div className="card" style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "1.1rem", fontWeight: "600" }}>Color Theme</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "12px", marginBottom: "20px" }}>
              {themes.map((t) => (
                <div
                  key={t.name}
                  onClick={() => handleThemeChange(t.name)}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    border: theme === t.name ? "3px solid var(--accent-1)" : "2px solid rgba(31,30,28,0.1)",
                    backgroundColor: "rgba(31,30,28,0.02)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 150ms ease",
                  }}
                >
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: t.color,
                    margin: "0 auto 8px",
                  }}></div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "500" }}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="card" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: "600" }}>Dark Mode</h3>
                <p className="muted" style={{ margin: "0", fontSize: "0.9rem" }}>Switch to dark theme for easier reading at night</p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "50px", height: "28px" }}>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={handleDarkModeToggle}
                  style={{ opacity: "0", width: "0", height: "0" }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: "0",
                  left: "0",
                  right: "0",
                  bottom: "0",
                  backgroundColor: darkMode ? "var(--accent-1)" : "#ccc",
                  transition: "all 250ms ease",
                  borderRadius: "28px",
                }}></span>
                <span style={{
                  position: "absolute",
                  content: "''",
                  height: "22px",
                  width: "22px",
                  left: darkMode ? "26px" : "3px",
                  bottom: "3px",
                  backgroundColor: "white",
                  transition: "all 250ms ease",
                  borderRadius: "50%",
                }}></span>
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="card" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: "600" }}>Notifications</h3>
                <p className="muted" style={{ margin: "0", fontSize: "0.9rem" }}>Receive notifications about messages and updates</p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "50px", height: "28px" }}>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                  style={{ opacity: "0", width: "0", height: "0" }}
                />
                <span style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: "0",
                  left: "0",
                  right: "0",
                  bottom: "0",
                  backgroundColor: notifications ? "var(--accent-1)" : "#ccc",
                  transition: "all 250ms ease",
                  borderRadius: "28px",
                }}></span>
                <span style={{
                  position: "absolute",
                  content: "''",
                  height: "22px",
                  width: "22px",
                  left: notifications ? "26px" : "3px",
                  bottom: "3px",
                  backgroundColor: "white",
                  transition: "all 250ms ease",
                  borderRadius: "50%",
                }}></span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button onClick={handleSaveSettings} disabled={saving} style={{ width: "100%" }}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </main>
    </div>
  );
}
