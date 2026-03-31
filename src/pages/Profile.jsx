import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import Sidebar from "../components/Sidebar";

export default function Profile({ isSidebarOpen, toggleSidebar }) {

  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const fileRef = useRef();

  useEffect(() => {

    API.get("/user/me")
      .then(res => setUser(res.data))
      .catch(() => window.location = "/");

  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm({
      ...form,
      profilePic: file
    });
  };

  const handleSave = async () => {

    try {

      const data = new FormData();

      Object.keys(form).forEach(key => {

        data.append(key, form[key]);

      });

      const res = await API.put("/user/me", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setUser(res.data);
      setEditing(false);

    } catch (err) {

      alert("Update failed");

    }

  };

  if (!user) return <div>Loading...</div>;

  return (

    <div className="layout">

      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar(false)}
      />

      <main className="main" style={{ padding: "20px" }}>

        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div className="hero" style={{ marginBottom: "30px" }}>
            <div className="lead">
              <h2 style={{ margin: "0 0 10px 0" }}>👤 My Profile</h2>
              <p className="muted" style={{ margin: 0 }}>Update your personal information</p>
            </div>
          </div>

        <div className="card" style={{ padding: "30px", borderRadius: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>

          <h2>Profile</h2>

          {/* PROFILE IMAGE */}

          <div style={{ marginBottom: 30, textAlign: "center", padding: "20px", background: "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(99,102,241,0.02) 100%)", borderRadius: "12px" }}>

            {user.profilePic?.url ? (

              <img
                src={user.profilePic.url}
                alt="profile"
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid #6366f1",
                  boxShadow: "0 8px 24px rgba(99,102,241,0.3)"
                }}
              />

            ) : (

              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 50,
                  margin: "auto",
                  boxShadow: "0 8px 24px rgba(99,102,241,0.3)"
                }}
              >
                {user.fullName?.[0]?.toUpperCase()}
              </div>

            )}

            {editing && (

              <div style={{ marginTop: 15 }}>

                <button onClick={() => fileRef.current.click()} style={{ background: "var(--accent-1)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.opacity = "0.9"}} onMouseLeave={(e) => {e.target.opacity = "1"}}>
                  📷 Change Photo
                </button>

                <input
                  type="file"
                  ref={fileRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

              </div>

            )}

          </div>

          {!editing ? (

            <>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                  <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>Full Name</p>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>{user.fullName}</p>
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                  <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>Email</p>
                  <p style={{ margin: 0, fontSize: "14px" }}>{user.email}</p>
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                  <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>Phone</p>
                  <p style={{ margin: 0, fontSize: "14px" }}>{user.phone}</p>
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                  <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>Gender</p>
                  <p style={{ margin: 0, fontSize: "14px" }}>{user.gender}</p>
                </div>
                <div style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                  <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>Age</p>
                  <p style={{ margin: 0, fontSize: "14px" }}>{user.age}</p>
                </div>
              </div>

              {/* STUDENT DETAILS */}

              {user.registrationType === "student" && user.studentDetails && (

                <div style={{ background: "linear-gradient(135deg, rgba(201,163,94,0.05) 0%, rgba(201,163,94,0.02) 100%)", padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid rgba(201,163,94,0.1)" }}>
                  <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem", color: "var(--accent-1)" }}>📚 Student Details</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div>
                      <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>Class</p>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>{user.studentDetails.standard}</p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>Board</p>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>{user.studentDetails.board}</p>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>Subjects</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {user.studentDetails.subjects?.map(s => (
                          <span key={s} style={{ background: "var(--accent-1)", color: "white", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              )}

              {/* TEACHER DETAILS */}

              {user.registrationType === "teacher" && user.teacherDetails && (

                <div style={{ background: "linear-gradient(135deg, rgba(72,187,120,0.05) 0%, rgba(72,187,120,0.02) 100%)", padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid rgba(72,187,120,0.1)" }}>
                  <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem", color: "#48bb78" }}>👨‍🏫 Teacher Details</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div>
                      <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>Teaching Upto</p>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>{user.teacherDetails.teachingUpto}</p>
                    </div>
                    <div>
                      <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>Distance</p>
                      <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>{user.teacherDetails.distance} km</p>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "var(--muted)", fontWeight: "600" }}>Expert Subjects</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {user.teacherDetails.subjectsExpert?.map(s => (
                          <span key={s} style={{ background: "#48bb78", color: "white", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              )}

              <button onClick={() => setEditing(true)} style={{ background: "var(--accent-1)", color: "white", border: "none", padding: "12px 30px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "15px", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.opacity = "0.9"}} onMouseLeave={(e) => {e.target.opacity = "1"}}>
                ✏️ Edit Profile
              </button>

            </>

          ) : (

            <>

              <h3 style={{ margin: "0 0 20px 0", fontSize: "1.1rem", fontWeight: "700" }}>📝 Edit Your Information</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", display: "block", marginBottom: "6px" }}>Full Name</label>
                  <input
                    name="fullName"
                    placeholder="Full Name"
                    defaultValue={user.fullName}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", display: "block", marginBottom: "6px" }}>Phone</label>
                  <input
                    name="phone"
                    placeholder="Phone"
                    defaultValue={user.phone}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", display: "block", marginBottom: "6px" }}>Age</label>
                  <input
                    name="age"
                    placeholder="Age"
                    defaultValue={user.age}
                    onChange={handleChange}
                    type="number"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                  />
                </div>
              </div>

              {/* STUDENT EDIT */}

              {user.registrationType === "student" && (

                <div style={{ background: "linear-gradient(135deg, rgba(201,163,94,0.05) 0%, rgba(201,163,94,0.02) 100%)", padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid rgba(201,163,94,0.1)" }}>
                  <h4 style={{ margin: "0 0 15px 0", fontSize: "1rem", color: "var(--accent-1)" }}>📚 Student Information</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div>
                      <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", display: "block", marginBottom: "6px" }}>Class</label>
                      <input
                        name="standard"
                        placeholder="Class"
                        defaultValue={user.studentDetails?.standard}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", display: "block", marginBottom: "6px" }}>Board</label>
                      <input
                        name="board"
                        placeholder="Board"
                        defaultValue={user.studentDetails?.board}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", display: "block", marginBottom: "6px" }}>Subjects (comma separated)</label>
                      <input
                        name="subjects"
                        placeholder="e.g. Math, Science, English"
                        defaultValue={user.studentDetails?.subjects?.join(", ")}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                      />
                    </div>
                  </div>
                </div>

              )}

              {/* TEACHER EDIT */}

              {user.registrationType === "teacher" && (

                <div style={{ background: "linear-gradient(135deg, rgba(72,187,120,0.05) 0%, rgba(72,187,120,0.02) 100%)", padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid rgba(72,187,120,0.1)" }}>
                  <h4 style={{ margin: "0 0 15px 0", fontSize: "1rem", color: "#48bb78" }}>👨‍🏫 Teacher Information</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div>
                      <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", display: "block", marginBottom: "6px" }}>Teaching Upto</label>
                      <input
                        name="teachingUpto"
                        placeholder="e.g. Class 12"
                        defaultValue={user.teacherDetails?.teachingUpto}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", display: "block", marginBottom: "6px" }}>Distance (km)</label>
                      <input
                        name="distance"
                        placeholder="Distance in km"
                        defaultValue={user.teacherDetails?.distance}
                        onChange={handleChange}
                        type="number"
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "600", display: "block", marginBottom: "6px" }}>Expert Subjects (comma separated)</label>
                      <input
                        name="subjectsExpert"
                        placeholder="e.g. Math, Physics, Chemistry"
                        defaultValue={user.teacherDetails?.subjectsExpert?.join(", ")}
                        onChange={handleChange}
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit" }}
                      />
                    </div>
                  </div>
                </div>

              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button onClick={() => setEditing(false)} style={{ background: "#f3f4f6", color: "#333", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.background = "#e5e7eb"}} onMouseLeave={(e) => {e.target.background = "#f3f4f6"}}>
                  Cancel
                </button>
                <button onClick={handleSave} style={{ background: "var(--accent-1)", color: "white", border: "none", padding: "12px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }} onMouseEnter={(e) => {e.target.opacity = "0.9"}} onMouseLeave={(e) => {e.target.opacity = "1"}}>
                  💾 Save Changes
                </button>
              </div>

            </>

          )}

        </div>
        </div>

      </main>

    </div>

  );

}