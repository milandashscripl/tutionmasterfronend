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
    registrationType: "",
    gender: "",
    age: "",
    addressText: "",
    lat: "",
    lng: "",
    standard: "",
    board: "",
    subjects: "",
    teachingUpto: "",
    distance: "",
    minFee: "",
    maxFee: "",
    pricing: "", // Added for the new backend logic
  });

  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.phone || !form.password || !form.registrationType) {
      return setError("Please fill required fields (Name, Phone, Password, Type)");
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach((k) => {
        data.append(k, form[k]);
      });

      if (profilePic) data.append("profilePic", profilePic);

      const res = await API.post("/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.message === "OTP_SENT") {
        navigate("/verify", { state: { phone: form.phone } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-visual-pane">
        <CanvasBg />
        <div className="user-glass-card">
          {form.registrationType === "teacher" ? "👨‍🏫" : "🎓"}
        </div>
        <div style={{ zIndex: 10, color: 'white', textAlign: 'center', marginTop: 30 }}>
          <h1 style={{ fontSize: '2.2rem', margin: 0 }}>Join TuitionMaster</h1>
          <p style={{ opacity: 0.6 }}>Register as a {form.registrationType || "New User"}</p>
        </div>
      </div>

      <div className="auth-form-pane">
        <div style={{ maxWidth: 500, width: '100%', padding: '40px 0' }}>
          <div className="card auth-card">
            <h2>Create Account</h2>
            <p className="muted" style={{ marginBottom: 20 }}>Please fill in your details</p>

            <form onSubmit={handleRegister}>
              <input name="fullName" placeholder="Full Name *" onChange={handleChange} />
              <input name="email" type="email" placeholder="Email" onChange={handleChange} />
              <input name="phone" placeholder="Phone *" onChange={handleChange} />

              <select name="registrationType" onChange={handleChange} value={form.registrationType}>
                <option value="">Select Type *</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>

              <input name="aadhar" placeholder="Aadhar Number" onChange={handleChange} />
              <input type="password" name="password" placeholder="Password *" onChange={handleChange} />

              <div className="grid-2">
                <select name="gender" onChange={handleChange}>
                  <option value="">Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
                <input name="age" placeholder="Age" onChange={handleChange} />
              </div>

              <input name="addressText" placeholder="Full Address" onChange={handleChange} />

              {form.registrationType === "student" && (
                <div className="reveal-visible">
                  <input name="standard" placeholder="Current Class (e.g. 10th)" onChange={handleChange} />
                  <input name="board" placeholder="Board (CBSE / ICSE / State)" onChange={handleChange} />
                  <input name="subjects" placeholder="Subjects needed (Math, Science)" onChange={handleChange} />
                </div>
              )}

              {form.registrationType === "teacher" && (
                <div className="reveal-visible">
                  <input name="teachingUpto" placeholder="Teaching ability (e.g. Upto 12th)" onChange={handleChange} />
                  <input name="subjects" placeholder="Your Expert Subjects (Comma separated)" onChange={handleChange} />
                  <input name="distance" placeholder="Distance coverage (km)" onChange={handleChange} />
                  <div className="grid-2">
                    <input name="minFee" type="number" placeholder="Min Fee (₹)" onChange={handleChange} />
                    <input name="maxFee" type="number" placeholder="Max Fee (₹)" onChange={handleChange} />
                  </div>
                  {/* IMPORTANT NEW FIELD */}
                  <input 
                    name="pricing" 
                    placeholder="Standard Pricing (e.g. 10:2500, 11:3000)" 
                    onChange={handleChange} 
                    title="Format: Class:Price, Class:Price"
                  />
                  <small className="muted" style={{ fontSize: '10px', display: 'block', marginBottom: '10px' }}>
                    Use format: Class:Price (e.g. 10:2000, 12:3500)
                  </small>
                </div>
              )}

              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: 5 }}>Profile Picture</label>
                <input type="file" onChange={handleFile} accept="image/*" />
                {preview && <img src={preview} className="preview-img" style={{ marginTop: 10 }} alt="preview" />}
              </div>

              <button type="submit" disabled={loading} style={{ marginTop: 20 }}>
                {loading ? "Registering..." : "Register"}
              </button>

              {error && <div className="error-box" style={{ marginTop: 15 }}>{error}</div>}
            </form>

            <p style={{ marginTop: 20, textAlign: 'center' }}>
              Already have an account? <span className="link" onClick={() => navigate("/")}>Login</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}