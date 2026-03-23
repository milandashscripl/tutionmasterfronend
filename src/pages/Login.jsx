import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import CanvasBg from "../components/CanvasBg";

export default function Login() {
  const navigate = useNavigate();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailOrPhone || !password) {
      return setError("All fields are required");
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/login", {
        emailOrPhone,
        password,
      });

      const user = res.data.user;
      const token = res.data.token;

      localStorage.setItem("token", token);

      if (user.settings) {
        localStorage.setItem("appTheme", user.settings.theme || "light");
        localStorage.setItem("darkMode", user.settings.darkMode ? "true" : "false");
      }

      const role = user.registrationType.toLowerCase();
      
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "student" || role === "teacher") {
        window.location.href = "/dashboard";
      } else {
        navigate("/auth-error", { state: { message: "Unknown user type" } });
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* VISUAL SIDE */}
      <div className="auth-visual-pane">
        <CanvasBg />
        <div className="user-glass-card">🔐</div>
        <div style={{ zIndex: 10, color: 'white', textAlign: 'center', marginTop: 30 }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: 10, margin: 0 }}>TuitionMaster</h1>
          <p style={{ opacity: 0.6 }}>Your Gateway to Personalized Learning</p>
        </div>
      </div>

      {/* FORM SIDE */}
      <div className="auth-form-pane">
        <div style={{ maxWidth: 400, width: '100%' }}>
          <div className="card auth-card">
            <h2 style={{ marginBottom: 6 }}>Welcome Back</h2>
            <p style={{ opacity: 0.9, marginTop: 0, marginBottom: 24 }}>
              Sign in to continue to TuitionMaster
            </p>

            <form onSubmit={handleLogin}>
              <label style={{ textAlign: "left", display: "block", marginBottom: 6, fontWeight: 600 }}>
                Email or Phone
              </label>
              <input
                placeholder="you@example.com or 9876543210"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
              />

              <label style={{ textAlign: "left", display: "block", marginBottom: 6, fontWeight: 600 }}>
                Password
              </label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <div className="error-box">{error}</div>}

              <button type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: 'center' }}>
              <span className="link" onClick={() => navigate("/register")}>
                Create an account
              </span>
              <span className="link" onClick={() => navigate("/forgot")}>
                Forgot password?
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}