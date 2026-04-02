import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Profile({ isSidebarOpen, toggleSidebar }) {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  // Initialize form with the user data once loaded
  const [form, setForm] = useState({});
  const fileRef = useRef();

  useEffect(() => {
    API.get("/user/me")
      .then((res) => {
        setUser(res.data);
        setForm(res.data); // Pre-fill the form with existing user data
      })
      .catch(() => (window.location = "/"));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 1. Handle Teacher-specific nested fields (matching Register.js)
    if (["teachingUpto", "distance", "subjectsExpert", "minFee", "maxFee", "pricing"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        teacherDetails: {
          ...(prev.teacherDetails || {}),
          [name]: name === "subjectsExpert" 
            ? value.split(",").map(s => s.trim()) 
            : value,
        },
      }));
    } 
    // 2. Handle Student-specific nested fields
    else if (["standard", "board", "subjects", "desiredMinFee", "desiredMaxFee"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        studentDetails: {
          ...(prev.studentDetails || {}),
          [name]: name === "subjects" 
            ? value.split(",").map(s => s.trim()) 
            : name === "desiredMinFee" || name === "desiredMaxFee"
              ? Number(value)
              : value,
        },
      }));
    } 
    // 3. Handle Top-level Profile fields
    else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, profilePic: file });
  };

  const handleSave = async () => {
    try {
      const data = new FormData();
      
      // Append top-level fields
      ["fullName", "phone", "age", "gender", "addressText", "aadhar"].forEach(key => {
        if (form[key]) data.append(key, form[key]);
      });

      if (form.profilePic instanceof File) {
        data.append("profilePic", form.profilePic);
      }

      // Append specialized details as JSON strings (matching backend expectation)
      if (user.registrationType === "teacher") {
        data.append("teacherDetails", JSON.stringify(form.teacherDetails));
      } else if (user.registrationType === "student") {
        data.append("studentDetails", JSON.stringify(form.studentDetails));
      }

      const res = await API.put("/user/me", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUser(res.data);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Update failed");
    }
  };

  if (!user) return <div style={{ padding: "50px", textAlign: "center" }}>Loading Profile...</div>;

  return (
    <div className="layout">
      <Sidebar user={user} isOpen={isSidebarOpen} onClose={() => toggleSidebar(false)} />

      <main className="main" style={{ padding: "20px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          
          <div className="card" style={{ padding: "30px", borderRadius: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", background: "#fff" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
              <h2>{editing ? "📝 Edit Profile" : "👤 My Profile"}</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} style={{ background: "#6366f1", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                  Edit Details
                </button>
              )}
            </div>

            {/* Profile Image Section */}
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <img 
                  src={form.profilePic instanceof File ? URL.createObjectURL(form.profilePic) : user.profilePic?.url || "https://via.placeholder.com/140"} 
                  alt="profile" 
                  style={{ width: 140, height: 140, borderRadius: "50%", objectFit: "cover", border: "4px solid #6366f1" }} 
                />
                {editing && (
                  <button 
                    onClick={() => fileRef.current.click()}
                    style={{ position: "absolute", bottom: 0, right: 0, background: "#6366f1", color: "#white", border: "none", borderRadius: "50%", width: "35px", height: "35px", cursor: "pointer" }}
                  >
                    📷
                  </button>
                )}
                <input type="file" ref={fileRef} hidden onChange={handleFileChange} />
              </div>
            </div>

            {!editing ? (
              /* VIEW MODE */
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <InfoItem label="Full Name" value={user.fullName} />
                <InfoItem label="Phone" value={user.phone} />
                <InfoItem label="Age" value={user.age} />
                <InfoItem label="Address" value={user.addressText} />
                
                {user.registrationType === "teacher" && (
                  <div style={{ gridColumn: "1 / -1", background: "#f0fff4", padding: "20px", borderRadius: "12px", marginTop: "10px" }}>
                    <h4 style={{ margin: "0 0 15px 0", color: "#2f855a" }}>Teaching Details</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                      <InfoItem label="Fee Range" value={`₹${user.teacherDetails?.minFee || 0} - ₹${user.teacherDetails?.maxFee || 0}`} />
                      <InfoItem label="Pricing" value={user.teacherDetails?.pricing} />
                      <InfoItem label="Distance" value={`${user.teacherDetails?.distance} km`} />
                      <InfoItem label="Level" value={user.teacherDetails?.teachingUpto} />
                    </div>
                  </div>
                )}

                {user.registrationType === "student" && (
                  <div style={{ gridColumn: "1 / -1", background: "#f0f5ff", padding: "20px", borderRadius: "12px", marginTop: "10px" }}>
                    <h4 style={{ margin: "0 0 15px 0", color: "#1d4ed8" }}>Preferred Teaching Budget</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                      <InfoItem label="Min Price" value={`₹${user.studentDetails?.desiredMinFee || 0}`} />
                      <InfoItem label="Max Price" value={`₹${user.studentDetails?.desiredMaxFee || 0}`} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* EDIT MODE */
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <Input label="Full Name" name="fullName" defaultValue={form.fullName} onChange={handleChange} />
                  <Input label="Phone" name="phone" defaultValue={form.phone} onChange={handleChange} />
                  <Input label="Age" name="age" type="number" defaultValue={form.age} onChange={handleChange} />
                  <Input label="Address" name="addressText" defaultValue={form.addressText} onChange={handleChange} />
                </div>

                {user.registrationType === "teacher" && (
                  <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                    <h4 style={{ marginTop: 0 }}>Professional Pricing & Coverage</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                      <Input label="Min Fee (₹)" name="minFee" type="number" defaultValue={form.teacherDetails?.minFee} onChange={handleChange} />
                      <Input label="Max Fee (₹)" name="maxFee" type="number" defaultValue={form.teacherDetails?.maxFee} onChange={handleChange} />
                      <div style={{ gridColumn: "1 / -1" }}>
                        <Input 
                          label="Standard Pricing (Class:Price)" 
                          name="pricing" 
                          placeholder="e.g. 10:2000, 12:3500" 
                          defaultValue={form.teacherDetails?.pricing} 
                          onChange={handleChange} 
                        />
                      </div>
                      <Input label="Teaching Upto" name="teachingUpto" defaultValue={form.teacherDetails?.teachingUpto} onChange={handleChange} />
                      <Input label="Distance (km)" name="distance" type="number" defaultValue={form.teacherDetails?.distance} onChange={handleChange} />
                    </div>
                  </div>
                )}

                {user.registrationType === "student" && (
                  <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                    <h4 style={{ marginTop: 0 }}>Student Fee Range</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                      <Input label="Desired Min Fee (₹)" name="desiredMinFee" type="number" defaultValue={form.studentDetails?.desiredMinFee} onChange={handleChange} />
                      <Input label="Desired Max Fee (₹)" name="desiredMaxFee" type="number" defaultValue={form.studentDetails?.desiredMaxFee} onChange={handleChange} />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                  <button onClick={() => { setEditing(false); setForm(user); }} style={{ padding: "12px 24px", borderRadius: "8px", border: "1px solid #ddd" }}>Cancel</button>
                  <button onClick={handleSave} style={{ padding: "12px 24px", borderRadius: "8px", background: "#6366f1", color: "white", border: "none", fontWeight: "bold" }}>Save Changes</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const InfoItem = ({ label, value }) => (
  <div>
    <label style={{ fontSize: "12px", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>{label}</label>
    <p style={{ margin: "4px 0", fontSize: "15px", fontWeight: "500" }}>{value || "Not set"}</p>
  </div>
);

const Input = ({ label, ...props }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
    <label style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{label}</label>
    <input {...props} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px" }} />
  </div>
);