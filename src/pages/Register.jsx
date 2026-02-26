import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import CanvasBg from "../components/CanvasBg";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    aadhar: "",
    addressText: "",
    lat: "",
    lng: "",
  });

  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setError("");
    if (!form.fullName || !form.email || form.password.length < 6 || !form.phone || !form.aadhar || !form.registrationType) {
      return setError("Please fill required fields: name, email, phone, aadhar, registration type and password (6+ chars)");
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => data.append(key, form[key]));
      if (profilePic) data.append("profilePic", profilePic);

      const res = await API.post("/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // backend responds with { message: 'OTP_SENT', phone }
      if (res.data?.message === "OTP_SENT") {
        navigate("/verify", { state: { phone: form.phone } });
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <CanvasBg />
      <div className="card auth-card">
        <h2 style={{ marginBottom: 6 }}>Create Account</h2>
      <p style={{ opacity: 0.9, marginTop: 0, marginBottom: 18 }}>
        Join TuitionMaster — quick signup
      </p>

      <form onSubmit={handleRegister}>
        <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>Full name</label>
        <input name="fullName" placeholder="Your full name" value={form.fullName} onChange={handleChange} />

        <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>Email</label>
        <input name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />

        <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>Phone</label>
        <input name="phone" autoComplete="tel" placeholder="9876543210" value={form.phone} onChange={handleChange} />

        <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>Registration type</label>
        <select name="registrationType" value={form.registrationType || ""} onChange={handleChange} style={{ width: "100%", padding: 12, borderRadius: 10, marginBottom: 12 }}>
          <option value="">Select type</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

        <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>Aadhar</label>
        <input name="aadhar" autoComplete="off" placeholder="Aadhar number" value={form.aadhar} onChange={handleChange} />

        <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>Password</label>
        <input type="password" name="password" autoComplete="new-password" placeholder="Choose a password" value={form.password} onChange={handleChange} />

        <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>Address (optional)</label>
        <input name="addressText" placeholder="Address" value={form.addressText} onChange={handleChange} />

        <label style={{ textAlign: "left", display: "block", marginBottom: 6 }}>Profile picture (optional)</label>
        <input type="file" accept="image/*" onChange={handleFile} />

        {preview && (
          <div style={{ marginBottom: 12 }}>
            <img src={preview} alt="preview" style={{ width: 96, height: 96, borderRadius: 12, objectFit: "cover" }} />
          </div>
        )}

        {error && (
          <div style={{ color: "#ffdddd", background: "#66131366", padding: 10, borderRadius: 8, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
      </form>

        <p className="link" style={{ marginTop: 12 }} onClick={() => navigate("/")}>
          Already have an account?
        </p>
      </div>
    </div>
  );
}