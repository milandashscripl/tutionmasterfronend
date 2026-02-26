import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/api";
import CanvasBg from "../components/CanvasBg";

export default function Verify() {  
  const navigate = useNavigate();
  const location = useLocation();
  const phoneFromState = location.state?.phone || "";

  const [phone, setPhone] = useState(phoneFromState);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e?.preventDefault();
    setError("");
    if (!phone || !otp) return setError("Phone and OTP are required");
    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", { phone, otp });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <CanvasBg />
      <div className="card auth-card">
        <h2 style={{ marginBottom: 6 }}>Verify Account</h2>
      <p style={{ opacity: 0.9, marginTop: 0, marginBottom: 18 }}>
        Enter the OTP we sent to your phone
      </p>

      <form onSubmit={handleVerify}>
        <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>Phone</label>
        <input name="phone" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>OTP</label>
        <input name="otp" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} />

        {error && (
          <div style={{ color: "#ffdddd", background: "#66131366", padding: 10, borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify"}</button>
      </form>

        <p className="link" style={{ marginTop: 12 }} onClick={() => navigate("/") }>
          Back to sign in
        </p>
      </div>
    </div>
  );
}
