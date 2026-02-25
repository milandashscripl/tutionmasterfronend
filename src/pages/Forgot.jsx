import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Forgot() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e?.preventDefault();
    setError("");
    if (!phone) return setError("Phone is required");
    setLoading(true);
    try {
      const res = await API.post("/auth/forgot-password", { phone });
      navigate("/reset", { state: { phone } });
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>Forgot password</h2>
        <p className="muted">Enter your registered phone to receive an OTP</p>

        <form onSubmit={handleSend}>
          <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>Phone</label>
          <input name="phone" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />

          {error && <div style={{ color: "#661313", background: "#ffefef", padding: 10, borderRadius: 8, marginBottom: 12 }}>{error}</div>}

          <button type="submit" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</button>
        </form>
      </div>
    </div>
  );
}
