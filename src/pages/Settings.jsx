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

  const themeOptions = [
    { name: "light", label: "Light", color: "#faf9f7" },
    { name: "ocean", label: "Ocean Blue", color: "#0066cc" },
    { name: "forest", label: "Forest Green", color: "#1b4332" },
    { name: "sunset", label: "Sunset Orange", color: "#ff6b35" },
    { name: "amethyst", label: "Amethyst Purple", color: "#7b2d94" },
    { name: "rose", label: "Rose Pink", color: "#d64161" },
    { name: "emerald", label: "Emerald Teal", color: "#00a080" },
    { name: "gold", label: "Gold Premium", color: "#d4af37" },
  ];

  const themesMap = {
    light: { "--bg": "#faf9f7", "--accent-1": "#c9a35e", "--muted": "#8b7968", "--text": "#1f1e1c" },
    ocean: { "--bg": "#f0f4f8", "--accent-1": "#0066cc", "--muted": "#4a90e2", "--text": "#001a4d" },
    forest: { "--bg": "#f0f8f4", "--accent-1": "#1b4332", "--muted": "#2d6a4f", "--text": "#0b2416" },
    sunset: { "--bg": "#fff4f0", "--accent-1": "#ff6b35", "--muted": "#ff8a50", "--text": "#8b3415" },
    amethyst: { "--bg": "#f5f3f8", "--accent-1": "#7b2d94", "--muted": "#a855f7", "--text": "#2d1b4e" },
    rose: { "--bg": "#fdf2f6", "--accent-1": "#d64161", "--muted": "#f56581", "--text": "#6b1835" },
    emerald: { "--bg": "#f0fdfb", "--accent-1": "#00a080", "--muted": "#1fc0a9", "--text": "#0d4d3f" },
    gold: { "--bg": "#fffdf5", "--accent-1": "#d4af37", "--muted": "#dfc577", "--text": "#664c1e" },
  };

  // Load user and initial theme from localStorage
  useEffect(() => {
    // Load from localStorage first
    const savedTheme = localStorage.getItem("appTheme");
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    
    if (savedTheme) setTheme(savedTheme);
    if (savedDarkMode) setDarkMode(savedDarkMode);

    // Then load from database
    API.get("/user/me")
      .then((res) => {
        const userData = res.data;
        setUser(userData);
        
        // Update states from DB
        if (userData.settings) {
          setTheme(userData.settings.theme || savedTheme || "light");
          setDarkMode(userData.settings.darkMode || savedDarkMode || false);
          setNotifications(userData.settings.notifications ?? true);
        }
      })
      .catch(() => { window.location.href = "/"; });
  }, []);

  // Apply theme CSS whenever 'theme' changes
  useEffect(() => {
    const selected = themesMap[theme] || themesMap.light;
    Object.keys(selected).forEach((key) => {
      document.documentElement.style.setProperty(key, selected[key]);
    });
    localStorage.setItem("appTheme", theme);
  }, [theme]);

  // Apply dark mode CSS whenever 'darkMode' changes
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    if (darkMode) {
      document.documentElement.style.setProperty("--text", "#e0e0e0");
      document.documentElement.style.setProperty("--bg", "#0d0d0d");
      document.body.style.backgroundColor = "#0d0d0d";
      document.body.style.color = "#e0e0e0";
      
      // Update all card backgrounds
      document.querySelectorAll(".card").forEach(card => {
        card.style.backgroundColor = "#1a1a1a";
        card.style.borderColor = "#333";
      });
      
      // Update input styles
      document.querySelectorAll("input, textarea, select").forEach(el => {
        el.style.backgroundColor = "#1a1a1a";
        el.style.color = "#e0e0e0";
        el.style.borderColor = "#444";
      });
    } else {
      document.documentElement.style.setProperty("--text", "#1f1e1c");
      document.documentElement.style.setProperty("--bg", "#faf9f7");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
      
      // Reset card backgrounds
      document.querySelectorAll(".card").forEach(card => {
        card.style.backgroundColor = "";
        card.style.borderColor = "";
      });
      
      // Reset input styles
      document.querySelectorAll("input, textarea, select").forEach(el => {
        el.style.backgroundColor = "";
        el.style.color = "";
        el.style.borderColor = "";
      });
    }  
  }, [darkMode]);

  const updateCSSTheme = (themeName) => {
    setTheme(themeName); // This will trigger the useEffect that applies CSS
  };

  const applyDarkMode = (isDark) => {
    setDarkMode(isDark); // This will trigger the useEffect that applies dark mode CSS
  };

const handleSaveSettings = async () => {
  setSaving(true);
  setSaveMessage("");
  try {
    const res = await API.put("/user/settings", {
      theme,
      darkMode,
      notifications,
    });

    // Extract the settings from the returned user object
    const updatedSettings = res.data.settings;

    if (updatedSettings) {
      setTheme(updatedSettings.theme);
      setDarkMode(updatedSettings.darkMode);
      setNotifications(updatedSettings.notifications);
    }

    setSaveMessage("Settings saved successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  } catch (err) {
    console.error("Save Error:", err);
    setSaveMessage("Failed to save settings");
  } finally {
    setSaving(false);
  }
};
  if (!user) return <div className="card">Loading...</div>;

  return (
    <div className="layout">
      <div
        className={"overlay " + (isSidebarOpen ? "open" : "")}
        onClick={() => toggleSidebar && toggleSidebar(false)}
      />

      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar && toggleSidebar(false)}
      />

      <main className="main" style={{ width: "100%" }}>
        <div className="hero">
          <div className="lead">
            <h1 style={{ fontSize: "2rem", marginBottom: "5px" }}>⚙️ Settings</h1>
            <p className="muted">Personalize your TuitionMaster experience</p>
          </div>
        </div>

        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px" }}>
          {saveMessage && (
            <div
              style={{
                padding: "14px 18px",
                marginBottom: "25px",
                borderRadius: "12px",
                backgroundColor: saveMessage.includes("success")
                  ? "rgba(72,187,120,0.15)"
                  : "rgba(201,163,94,0.15)",
                color: saveMessage.includes("success") ? "#2f855a" : "var(--accent-1)",
                border: `2px solid ${
                  saveMessage.includes("success") ? "#9ae6b4" : "rgba(201,163,94,0.4)"
                }`,
                borderRadius: "10px",
                animation: "slideIn 0.3s ease"
              }}
            >
              {saveMessage}
            </div>
          )}

          {/* Theme Selection */}
          <div className="card" style={{ 
            marginBottom: "30px",
            padding: "28px",
            borderRadius: "15px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            background: "linear-gradient(135deg, rgba(201,163,94,0.05) 0%, rgba(201,163,94,0.02) 100%)",
            border: "1px solid rgba(201,163,94,0.1)"
          }}>
            <div style={{ marginBottom: "8px" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "1.3rem", fontWeight: "700" }}>🎨 Color Theme</h3>
              <p className="muted" style={{ margin: "0", fontSize: "0.95rem" }}>Choose your favorite color palette</p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                gap: "14px",
                marginTop: "20px",
              }}
            >
              {themeOptions.map((t) => (
                <div
                  key={t.name}
                  onClick={() => updateCSSTheme(t.name)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: theme === t.name ? `3px solid ${t.color}` : "2px solid rgba(31,30,28,0.1)",
                    backgroundColor: theme === t.name ? "rgba(201,163,94,0.08)" : "rgba(31,30,28,0.02)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: theme === t.name ? "scale(1.05)" : "scale(1)",
                    boxShadow: theme === t.name ? `0 6px 20px ${t.color}40` : "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={(e) => {
                    if (theme !== t.name) {
                      e.currentTarget.style.transform = "scale(1.03)";
                      e.currentTarget.style.boxShadow = `0 4px 12px ${t.color}30`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (theme !== t.name) {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                    }
                  }}
                >
                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "10px",
                      backgroundColor: t.color,
                      margin: "0 auto 10px",
                      boxShadow: `0 4px 12px ${t.color}60`,
                      transition: "all 250ms ease"
                    }}
                  ></div>
                  <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text)" }}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="card" style={{ 
            marginBottom: "30px",
            padding: "28px",
            borderRadius: "15px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid rgba(31,30,28,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 6px 0", fontSize: "1.15rem", fontWeight: "700" }}>🌙 Dark Mode</h3>
                <p className="muted" style={{ margin: "0", fontSize: "0.95rem" }}>
                  Easier on the eyes for nighttime browsing
                </p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "60px", height: "34px" }}>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => applyDarkMode(!darkMode)}
                  style={{ opacity: "0", width: "0", height: "0" }}
                />
                <span
                  style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: "0", left: "0", right: "0", bottom: "0",
                    backgroundColor: darkMode ? "var(--accent-1)" : "#ccc",
                    transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                    borderRadius: "34px",
                    boxShadow: darkMode ? `0 0 12px var(--accent-1)40` : "none",
                  }}
                ></span>
                <span
                  style={{
                    position: "absolute",
                    height: "26px", width: "26px",
                    left: darkMode ? "32px" : "4px",
                    bottom: "4px",
                    backgroundColor: "white",
                    transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                    borderRadius: "50%",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                ></span>
              </label>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="card" style={{ 
            marginBottom: "30px",
            padding: "28px",
            borderRadius: "15px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            border: "1px solid rgba(31,30,28,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 6px 0", fontSize: "1.15rem", fontWeight: "700" }}>🔔 Notifications</h3>
                <p className="muted" style={{ margin: "0", fontSize: "0.95rem" }}>
                  Get alerts about messages, chats, and updates
                </p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "60px", height: "34px" }}>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                  style={{ opacity: "0", width: "0", height: "0" }}
                />
                <span
                  style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: "0", left: "0", right: "0", bottom: "0",
                    backgroundColor: notifications ? "var(--accent-1)" : "#ccc",
                    transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                    borderRadius: "34px",
                    boxShadow: notifications ? `0 0 12px var(--accent-1)40` : "none",
                  }}
                ></span>
                <span
                  style={{
                    position: "absolute",
                    height: "26px", width: "26px",
                    left: notifications ? "32px" : "4px",
                    bottom: "4px",
                    backgroundColor: "white",
                    transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                    borderRadius: "50%",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                ></span>
              </label>
            </div>
          </div>

          <button 
            onClick={handleSaveSettings} 
            disabled={saving} 
            style={{ 
              width: "100%",
              padding: "16px 24px",
              fontSize: "1.05rem",
              fontWeight: "700",
              background: saving ? "#ccc" : "var(--accent-1)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: saving ? "not-allowed" : "pointer",
              transition: "all 300ms ease",
              boxShadow: `0 4px 15px ${saving ? "rgba(0,0,0,0.1)" : "var(--accent-1)40"}`,
              transform: saving ? "scale(1)" : "scale(1)",
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 6px 20px var(--accent-1)60";
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 15px var(--accent-1)40";
              }
            }}
          >
            {saving ? "💾 Saving..." : "✓ Save Settings"}
          </button>

          <style>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      </main>
    </div>
  );
}