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
    e?.preventDefault();
    setError("");
    if (!emailOrPhone || !password) return setError("All fields are required");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", {
        emailOrPhone,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <CanvasBg />
      <div className="card auth-card" role="main">
        <h2 style={{ marginBottom: 6 }}>Welcome Back</h2>
      <p style={{ opacity: 0.9, marginTop: 0, marginBottom: 18 }}>
        Sign in to continue to TuitionMaster
      </p>

      <form onSubmit={handleLogin}>
        <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>
          Email or Phone
        </label>
        <input
          placeholder="you@example.com or 9876543210"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
        />

        <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>
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

        {error && (
          <div style={{ color: "#ffdddd", background: "#66131366", padding: 10, borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

        <p className="link" style={{ marginTop: 12 }} onClick={() => navigate("/register")}>
          Create an account
        </p>
      </div>
    </div>
  );
}