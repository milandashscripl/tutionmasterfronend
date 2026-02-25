import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Reset() {
  const location = useLocation();
  const navigate = useNavigate();
  const phoneFromState = location.state?.phone || "";

  const [phone, setPhone] = useState(phoneFromState);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e?.preventDefault();
    setError("");
    if (!phone || !otp || !newPassword) return setError("All fields are required");
    setLoading(true);
    try {
      await API.post("/auth/reset-password", { phone, otp, newPassword });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>Reset password</h2>
        <p className="muted">Enter the OTP sent to your phone and choose a new password</p>

        <form onSubmit={handleReset}>
          <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>Phone</label>
          <input name="phone" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>OTP</label>
          <input name="otp" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} />

          <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>New password</label>
          <input type="password" name="newPassword" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

          {error && <div style={{ color: "#661313", background: "#ffefef", padding: 10, borderRadius: 8, marginBottom: 12 }}>{error}</div>}

          <button type="submit" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>
        </form>
      </div>
    </div>
  );
}
